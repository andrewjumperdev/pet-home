/**
 * Controlador de Reservas - Gestión completa
 * Incluye confirmación, rechazo, cancelación y refunds
 */

import Stripe from 'stripe';
import admin from 'firebase-admin';
import { generateCancelToken, verifyCancelToken } from '../middleware/auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

/**
 * Política de cancelación
 */
const CANCELLATION_POLICY = {
  // Cancelación gratuita hasta X días antes
  freeCancellationDays: 3,
  // Porcentaje de reembolso después
  partialRefundPercentage: 50,
  // Sin reembolso si faltan menos de X horas
  noRefundHours: 24
};

/**
 * POST /api/bookings/confirm
 * Confirmar reserva y procesar pago
 */
export const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId requerido' });
    }

    // Obtener reserva
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const booking = { id: bookingDoc.id, ...bookingDoc.data() };

    // Verificar estado
    if (booking.status !== 'pending') {
      return res.status(400).json({
        error: 'Estado inválido',
        message: `La reserva está en estado: ${booking.status}`
      });
    }

    // Verificar que tiene método de pago
    if (!booking.paymentMethodId) {
      return res.status(400).json({
        error: 'Sin método de pago',
        message: 'Esta reserva no tiene un método de pago asociado'
      });
    }

    // Procesar pago con Stripe
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.total * 100), // Centavos
        currency: 'eur',
        payment_method: booking.paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        metadata: {
          bookingId: booking.id,
          customerEmail: booking.contact?.email,
          customerName: booking.contact?.name,
          service: booking.serviceId,
          date: booking.date
        }
      });
    } catch (stripeError) {
      console.error('❌ Error Stripe:', stripeError.message);

      // Actualizar booking con error de pago
      await bookingRef.update({
        paymentError: stripeError.message,
        paymentErrorAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(400).json({
        error: 'Error procesando pago',
        message: stripeError.message,
        code: stripeError.code
      });
    }

    // Generar token de cancelación
    const cancelToken = generateCancelToken(booking.id);

    // Actualizar reserva como confirmada
    await bookingRef.update({
      status: 'confirmed',
      confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentId: paymentIntent.id,
      paymentStatus: 'paid',
      cancelToken: cancelToken
    });

    console.log(`✅ Reserva confirmada: ${bookingId} - Pago: ${paymentIntent.id}`);

    res.json({
      success: true,
      booking: {
        ...booking,
        status: 'confirmed',
        paymentId: paymentIntent.id,
        cancelToken
      },
      payment: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        status: paymentIntent.status
      }
    });

  } catch (error) {
    console.error('❌ Error confirmando reserva:', error);
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
};

/**
 * POST /api/bookings/reject
 * Rechazar reserva (sin cobro)
 */
export const rejectBooking = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId requerido' });
    }

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const booking = { id: bookingDoc.id, ...bookingDoc.data() };

    if (booking.status !== 'pending') {
      return res.status(400).json({
        error: 'Estado inválido',
        message: 'Solo se pueden rechazar reservas pendientes'
      });
    }

    // Actualizar como rechazada
    await bookingRef.update({
      status: 'rejected',
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      rejectionReason: reason || 'Capacidad no disponible'
    });

    console.log(`❌ Reserva rechazada: ${bookingId} - Razón: ${reason}`);

    res.json({
      success: true,
      booking: {
        ...booking,
        status: 'rejected',
        rejectionReason: reason
      }
    });

  } catch (error) {
    console.error('❌ Error rechazando reserva:', error);
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
};

/**
 * POST /api/bookings/cancel
 * Cancelar reserva (con posible refund)
 */
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId, token, reason } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId requerido' });
    }

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const booking = { id: bookingDoc.id, ...bookingDoc.data() };

    // Verificar token de cancelación (si fue cancelación del cliente)
    if (token) {
      const tokenData = verifyCancelToken(token);
      if (!tokenData || tokenData.bookingId !== bookingId) {
        return res.status(403).json({
          error: 'Token inválido',
          message: 'El enlace de cancelación no es válido o ha expirado'
        });
      }
    }

    // Solo cancelar si está pending o confirmed
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        error: 'No se puede cancelar',
        message: `La reserva está en estado: ${booking.status}`
      });
    }

    // Calcular reembolso
    let refundAmount = 0;
    let refundId = null;

    if (booking.paymentId && booking.paymentStatus === 'paid') {
      // Calcular días hasta la reserva
      const bookingDate = new Date(booking.date);
      const now = new Date();
      const daysUntilBooking = Math.ceil((bookingDate - now) / (1000 * 60 * 60 * 24));
      const hoursUntilBooking = Math.ceil((bookingDate - now) / (1000 * 60 * 60));

      if (daysUntilBooking >= CANCELLATION_POLICY.freeCancellationDays) {
        // Reembolso completo
        refundAmount = booking.total;
      } else if (hoursUntilBooking >= CANCELLATION_POLICY.noRefundHours) {
        // Reembolso parcial
        refundAmount = booking.total * (CANCELLATION_POLICY.partialRefundPercentage / 100);
      }
      // Si es menos de noRefundHours, no hay reembolso

      // Procesar reembolso en Stripe
      if (refundAmount > 0) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: booking.paymentId,
            amount: Math.round(refundAmount * 100), // Centavos
            reason: 'requested_by_customer',
            metadata: {
              bookingId: booking.id,
              originalAmount: booking.total,
              refundPercentage: Math.round((refundAmount / booking.total) * 100)
            }
          });

          refundId = refund.id;
          console.log(`💰 Reembolso procesado: ${refundId} - ${refundAmount}€`);

        } catch (stripeError) {
          console.error('❌ Error en reembolso:', stripeError.message);
          // Continuar con la cancelación aunque falle el reembolso
          // Se puede procesar manualmente después
        }
      }
    }

    // Actualizar reserva como cancelada
    await bookingRef.update({
      status: 'cancelled',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancellationReason: reason || 'Cancelado por el cliente',
      refundAmount: refundAmount,
      refundId: refundId,
      paymentStatus: refundAmount > 0 ? 'refunded' : booking.paymentStatus
    });

    console.log(`🔄 Reserva cancelada: ${bookingId} - Reembolso: ${refundAmount}€`);

    res.json({
      success: true,
      booking: {
        ...booking,
        status: 'cancelled'
      },
      refund: {
        amount: refundAmount,
        id: refundId,
        policy: {
          freeCancellationDays: CANCELLATION_POLICY.freeCancellationDays,
          message: refundAmount === booking.total
            ? 'Reembolso completo procesado'
            : refundAmount > 0
              ? `Reembolso parcial (${CANCELLATION_POLICY.partialRefundPercentage}%) procesado`
              : 'Sin reembolso según política de cancelación'
        }
      }
    });

  } catch (error) {
    console.error('❌ Error cancelando reserva:', error);
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
};

/**
 * GET /api/bookings/:id
 * Obtener detalles de una reserva
 */
export const getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, token } = req.query;

    const bookingRef = db.collection('bookings').doc(id);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const booking = { id: bookingDoc.id, ...bookingDoc.data() };

    // Verificar acceso (por email o token)
    const hasAccess =
      (email && booking.contact?.email?.toLowerCase() === email.toLowerCase()) ||
      (token && verifyCancelToken(token)?.bookingId === id);

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permiso para ver esta reserva'
      });
    }

    // No enviar datos sensibles
    const safeBooking = {
      id: booking.id,
      status: booking.status,
      date: booking.date,
      endDate: booking.endDate,
      serviceId: booking.serviceId,
      serviceName: booking.serviceName,
      quantity: booking.quantity,
      total: booking.total,
      arrivalTime: booking.arrivalTime,
      departureTime: booking.departureTime,
      details: booking.details,
      contact: {
        name: booking.contact?.name,
        email: booking.contact?.email
      },
      createdAt: booking.createdAt,
      confirmedAt: booking.confirmedAt,
      cancelledAt: booking.cancelledAt,
      refundAmount: booking.refundAmount
    };

    res.json({ booking: safeBooking });

  } catch (error) {
    console.error('❌ Error obteniendo reserva:', error);
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
};

/**
 * GET /api/bookings/by-email/:email
 * Obtener reservas por email del cliente
 */
export const getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    const snapshot = await db.collection('bookings')
      .where('contact.email', '==', email.toLowerCase())
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const bookings = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        status: data.status,
        date: data.date,
        endDate: data.endDate,
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        quantity: data.quantity,
        total: data.total,
        createdAt: data.createdAt
      });
    });

    res.json({ bookings });

  } catch (error) {
    console.error('❌ Error obteniendo reservas:', error);
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
};

/**
 * GET /api/bookings/cancel-policy
 * Obtener política de cancelación
 */
export const getCancellationPolicy = async (req, res) => {
  res.json({
    policy: CANCELLATION_POLICY,
    description: {
      fr: {
        title: "Politique d'annulation",
        rules: [
          `Annulation gratuite jusqu'à ${CANCELLATION_POLICY.freeCancellationDays} jours avant`,
          `Remboursement de ${CANCELLATION_POLICY.partialRefundPercentage}% entre ${CANCELLATION_POLICY.freeCancellationDays} jours et ${CANCELLATION_POLICY.noRefundHours} heures avant`,
          `Aucun remboursement moins de ${CANCELLATION_POLICY.noRefundHours} heures avant`
        ]
      },
      es: {
        title: "Política de cancelación",
        rules: [
          `Cancelación gratuita hasta ${CANCELLATION_POLICY.freeCancellationDays} días antes`,
          `Reembolso del ${CANCELLATION_POLICY.partialRefundPercentage}% entre ${CANCELLATION_POLICY.freeCancellationDays} días y ${CANCELLATION_POLICY.noRefundHours} horas antes`,
          `Sin reembolso con menos de ${CANCELLATION_POLICY.noRefundHours} horas de anticipación`
        ]
      }
    }
  });
};

export default {
  confirmBooking,
  rejectBooking,
  cancelBooking,
  getBooking,
  getBookingsByEmail,
  getCancellationPolicy
};
