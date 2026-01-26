/**
 * Controlador de Capacidad - Anti-Overbooking
 * Valida disponibilidad en tiempo real antes de aceptar reservas
 *
 * Requiere Firebase Admin SDK configurado
 */

import admin from 'firebase-admin';

// Inicializar Firebase Admin si no está inicializado
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
 * Configuración de capacidad por servicio
 */
const CAPACITY_CONFIG = {
  // Capacidad máxima por día
  MAX_CAPACITY_PER_DAY: 5,

  // Capacidad por tipo de servicio
  services: {
    flash: { maxPerDay: 5, name: 'Formule Flash' },
    '1': { maxPerDay: 5, name: 'Formule Flash' },
    sejour: { maxPerDay: 5, name: 'Formule Séjour' },
    '2': { maxPerDay: 5, name: 'Formule Séjour' },
    felin: { maxPerDay: 8, name: 'Formule Félin' }, // Gatos tienen más capacidad
  },

  // Restricciones especiales
  restrictions: {
    maxLargeDogsPerDay: 2,  // Máximo de perros grandes por día
    minHoursBeforeBooking: 24, // Horas mínimas de anticipación
  }
};

/**
 * Obtener reservas para un rango de fechas
 */
async function getBookingsForDateRange(startDate, endDate) {
  const bookingsRef = db.collection('bookings');

  // Query para obtener reservas en el rango
  const snapshot = await bookingsRef
    .where('date', '>=', startDate)
    .where('date', '<=', endDate || startDate)
    .where('status', 'in', ['pending', 'confirmed'])
    .get();

  const bookings = [];
  snapshot.forEach(doc => {
    bookings.push({ id: doc.id, ...doc.data() });
  });

  return bookings;
}

/**
 * Calcular capacidad usada por día
 */
function calculateUsedCapacity(bookings, date) {
  const dayBookings = bookings.filter(b => b.date === date);

  let totalPets = 0;
  let largeDogs = 0;
  let pending = 0;
  let confirmed = 0;

  dayBookings.forEach(booking => {
    const qty = booking.quantity || 1;
    totalPets += qty;

    if (booking.status === 'pending') {
      pending += qty;
    } else if (booking.status === 'confirmed') {
      confirmed += qty;
    }

    // Contar perros grandes
    if (booking.sizes?.includes('Gros chien')) {
      largeDogs++;
    }
  });

  return {
    date,
    totalPets,
    largeDogs,
    pending,
    confirmed,
    available: CAPACITY_CONFIG.MAX_CAPACITY_PER_DAY - totalPets,
    largeDogSlotsAvailable: CAPACITY_CONFIG.restrictions.maxLargeDogsPerDay - largeDogs
  };
}

/**
 * GET /api/capacity/check
 * Verificar disponibilidad para fechas específicas
 *
 * Query params:
 * - startDate: fecha inicio (YYYY-MM-DD)
 * - endDate: fecha fin (YYYY-MM-DD) - opcional
 * - quantity: número de mascotas
 * - hasLargeDog: si incluye perro grande (true/false)
 * - serviceId: ID del servicio
 */
export const checkCapacity = async (req, res) => {
  try {
    const { startDate, endDate, quantity = 1, hasLargeDog = false, serviceId } = req.query;

    if (!startDate) {
      return res.status(400).json({ error: 'startDate es requerido' });
    }

    // Validar fecha mínima de anticipación
    const now = new Date();
    const bookingDate = new Date(startDate);
    const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);

    if (hoursUntilBooking < CAPACITY_CONFIG.restrictions.minHoursBeforeBooking) {
      return res.json({
        available: false,
        reason: `Las reservas deben hacerse con al menos ${CAPACITY_CONFIG.restrictions.minHoursBeforeBooking} horas de anticipación`,
        code: 'TOO_LATE'
      });
    }

    // Obtener reservas existentes
    const bookings = await getBookingsForDateRange(startDate, endDate || startDate);

    // Generar array de fechas a verificar
    const dates = [];
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate || startDate);

    while (currentDate <= finalDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Verificar cada día
    const capacityByDay = dates.map(date => calculateUsedCapacity(bookings, date));

    // Verificar si hay disponibilidad para todas las fechas
    const unavailableDates = [];
    const largeDogUnavailable = [];

    for (const day of capacityByDay) {
      if (day.available < parseInt(quantity)) {
        unavailableDates.push({
          date: day.date,
          available: day.available,
          requested: parseInt(quantity)
        });
      }

      if (hasLargeDog === 'true' && day.largeDogSlotsAvailable < 1) {
        largeDogUnavailable.push(day.date);
      }
    }

    // Respuesta
    if (unavailableDates.length > 0) {
      return res.json({
        available: false,
        reason: 'Capacidad insuficiente para algunas fechas',
        code: 'CAPACITY_EXCEEDED',
        unavailableDates,
        capacityByDay
      });
    }

    if (largeDogUnavailable.length > 0) {
      return res.json({
        available: false,
        reason: 'No hay espacio para perros grandes en algunas fechas',
        code: 'LARGE_DOG_LIMIT',
        unavailableDates: largeDogUnavailable,
        capacityByDay
      });
    }

    res.json({
      available: true,
      capacityByDay,
      message: 'Disponibilidad confirmada'
    });

  } catch (error) {
    console.error('❌ Error verificando capacidad:', error);
    res.status(500).json({ error: 'Error verificando disponibilidad', details: error.message });
  }
};

/**
 * GET /api/capacity/calendar
 * Obtener calendario de disponibilidad para un mes
 *
 * Query params:
 * - month: mes (1-12)
 * - year: año (YYYY)
 * - serviceId: ID del servicio (opcional)
 */
export const getCapacityCalendar = async (req, res) => {
  try {
    const { month, year, serviceId } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'month y year son requeridos' });
    }

    // Calcular primer y último día del mes
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`;

    // Obtener reservas del mes
    const bookings = await getBookingsForDateRange(startDate, endDate);

    // Calcular capacidad para cada día
    const calendar = [];
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const capacity = calculateUsedCapacity(bookings, dateStr);

      calendar.push({
        date: dateStr,
        dayOfWeek: currentDate.getDay(),
        ...capacity,
        status: capacity.available <= 0 ? 'full' :
          capacity.available <= 2 ? 'limited' : 'available'
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      month: parseInt(month),
      year: parseInt(year),
      maxCapacity: CAPACITY_CONFIG.MAX_CAPACITY_PER_DAY,
      calendar
    });

  } catch (error) {
    console.error('❌ Error obteniendo calendario:', error);
    res.status(500).json({ error: 'Error obteniendo calendario', details: error.message });
  }
};

/**
 * POST /api/capacity/reserve
 * Reservar capacidad temporalmente (bloqueo de 15 minutos)
 * Usado durante el checkout para evitar race conditions
 */
export const reserveCapacity = async (req, res) => {
  try {
    const { dates, quantity, sessionId } = req.body;

    if (!dates || !quantity || !sessionId) {
      return res.status(400).json({ error: 'dates, quantity y sessionId son requeridos' });
    }

    // Verificar disponibilidad primero
    const bookings = await getBookingsForDateRange(dates[0], dates[dates.length - 1]);

    for (const date of dates) {
      const capacity = calculateUsedCapacity(bookings, date);
      if (capacity.available < quantity) {
        return res.status(409).json({
          error: 'Capacidad no disponible',
          date,
          available: capacity.available,
          requested: quantity
        });
      }
    }

    // Crear reserva temporal
    const tempReservation = {
      sessionId,
      dates,
      quantity,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
      status: 'temporary'
    };

    const docRef = await db.collection('temp_reservations').add(tempReservation);

    console.log(`✅ Capacidad reservada temporalmente: ${sessionId}`);

    res.json({
      success: true,
      reservationId: docRef.id,
      expiresIn: 15 * 60, // segundos
      message: 'Capacidad reservada por 15 minutos'
    });

  } catch (error) {
    console.error('❌ Error reservando capacidad:', error);
    res.status(500).json({ error: 'Error reservando capacidad', details: error.message });
  }
};

/**
 * DELETE /api/capacity/reserve/:reservationId
 * Liberar reserva temporal
 */
export const releaseCapacity = async (req, res) => {
  try {
    const { reservationId } = req.params;

    await db.collection('temp_reservations').doc(reservationId).delete();

    console.log(`✅ Reserva temporal liberada: ${reservationId}`);
    res.json({ success: true });

  } catch (error) {
    console.error('❌ Error liberando reserva:', error);
    res.status(500).json({ error: 'Error liberando reserva', details: error.message });
  }
};

export default {
  checkCapacity,
  getCapacityCalendar,
  reserveCapacity,
  releaseCapacity
};
