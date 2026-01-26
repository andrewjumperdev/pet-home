/**
 * Controlador de Emails - Maison pour Pets
 * Sistema profesional de notificaciones por email
 *
 * Usa Resend (https://resend.com) - 3000 emails/mes gratis
 * Alternativa: SendGrid, Mailgun, AWS SES
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'Maison pour Pets <reservations@maisonpourpets.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@maisonpourpets.com';
const SITE_URL = process.env.SITE_URL || 'https://maisonpourpets.com';

/**
 * Templates de email con diseño profesional
 */
const emailTemplates = {
  /**
   * Email de solicitud recibida (al cliente)
   */
  bookingReceived: (booking) => ({
    subject: `🐾 Solicitud recibida - Maison pour Pets #${booking.id?.slice(-6) || 'NEW'}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud Recibida</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🐾 Maison pour Pets</h1>
        <p style="color: #ccfbf1; margin: 10px 0 0 0; font-size: 14px;">Pension premium pour vos compagnons</p>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Bonjour ${booking.contact?.name || 'Client'} 👋</h2>

        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          Nous avons bien reçu votre demande de réservation. Notre équipe va l'examiner et vous confirmer la disponibilité dans les plus brefs délais.
        </p>

        <!-- Booking Details Card -->
        <div style="background-color: #f1f5f9; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
          <h3 style="color: #0d9488; margin: 0 0 15px 0; font-size: 18px;">📋 Détails de votre demande</h3>

          <table width="100%" cellpadding="8" cellspacing="0">
            <tr>
              <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Service</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0; text-align: right;">${booking.serviceName || booking.serviceId}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Date(s)</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatDateRange(booking.date, booking.endDate)}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Horaires</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0; text-align: right;">${booking.arrivalTime} - ${booking.departureTime}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Animaux</td>
              <td style="color: #1e293b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0; text-align: right;">${booking.quantity} compagnon(s)</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-size: 14px;">Total estimé</td>
              <td style="color: #0d9488; font-size: 18px; font-weight: 700; text-align: right;">${booking.total?.toFixed(2) || '0.00'} €</td>
            </tr>
          </table>
        </div>

        <!-- Pet Details -->
        ${booking.details?.length > 0 ? `
        <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
          <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">🐕 Vos compagnons</h4>
          ${booking.details.map(pet => `
            <p style="color: #78350f; margin: 5px 0; font-size: 14px;">
              • <strong>${pet.name}</strong> - ${pet.breed}, ${pet.age} an(s)
            </p>
          `).join('')}
        </div>
        ` : ''}

        <!-- Status Badge -->
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 12px 24px; border-radius: 50px; font-size: 14px; font-weight: 600;">
            ⏳ En attente de confirmation
          </span>
        </div>

        <!-- Info Box -->
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px 20px; margin-bottom: 25px;">
          <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.5;">
            <strong>💳 Important :</strong> Votre carte a été enregistrée de manière sécurisée mais ne sera débitée qu'après confirmation de votre réservation.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${SITE_URL}/#/mes-reservations?email=${encodeURIComponent(booking.contact?.email)}"
             style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Suivre ma réservation
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #1e293b; padding: 30px; text-align: center;">
        <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">
          Des questions ? Contactez-nous
        </p>
        <p style="color: #ffffff; margin: 0 0 20px 0; font-size: 16px; font-weight: 600;">
          📧 contact@maisonpourpets.com | 📞 +33 6 XX XX XX XX
        </p>
        <p style="color: #64748b; margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} Maison pour Pets. Tous droits réservés.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }),

  /**
   * Email de confirmación (al cliente) - Pago procesado
   */
  bookingConfirmed: (booking) => ({
    subject: `✅ Réservation confirmée - Maison pour Pets #${booking.id?.slice(-6) || ''}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 30px; text-align: center;">
        <div style="font-size: 60px; margin-bottom: 10px;">✅</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Réservation Confirmée !</h1>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Bonjour ${booking.contact?.name} 🎉</h2>

        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          Excellente nouvelle ! Votre réservation a été <strong style="color: #059669;">confirmée</strong> et votre paiement a été traité avec succès. Nous avons hâte d'accueillir vos compagnons !
        </p>

        <!-- Confirmation Card -->
        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 2px solid #10b981;">
          <h3 style="color: #047857; margin: 0 0 15px 0; font-size: 18px;">🎫 Confirmation de réservation</h3>

          <table width="100%" cellpadding="8" cellspacing="0">
            <tr>
              <td style="color: #065f46; font-size: 14px;">N° Réservation</td>
              <td style="color: #047857; font-size: 16px; font-weight: 700; text-align: right;">#${booking.id?.slice(-6) || 'N/A'}</td>
            </tr>
            <tr>
              <td style="color: #065f46; font-size: 14px;">Service</td>
              <td style="color: #047857; font-size: 14px; font-weight: 600; text-align: right;">${booking.serviceName || booking.serviceId}</td>
            </tr>
            <tr>
              <td style="color: #065f46; font-size: 14px;">Date(s)</td>
              <td style="color: #047857; font-size: 14px; font-weight: 600; text-align: right;">${formatDateRange(booking.date, booking.endDate)}</td>
            </tr>
            <tr>
              <td style="color: #065f46; font-size: 14px;">Arrivée</td>
              <td style="color: #047857; font-size: 14px; font-weight: 600; text-align: right;">📍 ${booking.arrivalTime}</td>
            </tr>
            <tr>
              <td style="color: #065f46; font-size: 14px;">Départ</td>
              <td style="color: #047857; font-size: 14px; font-weight: 600; text-align: right;">🚗 ${booking.departureTime}</td>
            </tr>
          </table>
        </div>

        <!-- Payment Confirmation -->
        <div style="background-color: #f0fdf4; border-radius: 8px; padding: 15px 20px; margin-bottom: 25px; text-align: center;">
          <p style="color: #166534; margin: 0; font-size: 14px;">
            💳 Paiement reçu : <strong>${booking.total?.toFixed(2) || '0.00'} €</strong>
          </p>
        </div>

        <!-- Checklist -->
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
          <h4 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">📝 À apporter le jour J</h4>
          <ul style="color: #475569; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
            <li>Carnet de santé à jour</li>
            <li>Alimentation habituelle (si régime spécial)</li>
            <li>Couverture ou jouet favori</li>
            <li>Coordonnées du vétérinaire</li>
          </ul>
        </div>

        <!-- Address -->
        <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center;">
          <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📍 Notre adresse</h4>
          <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.5;">
            Maison pour Pets<br>
            123 Rue des Animaux<br>
            75000 Paris
          </p>
          <a href="https://maps.google.com/?q=Maison+pour+Pets"
             style="display: inline-block; margin-top: 10px; color: #92400e; font-size: 14px; font-weight: 600;">
            Voir sur Google Maps →
          </a>
        </div>

        <!-- Cancel Link -->
        <div style="text-align: center; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Besoin d'annuler ?
            <a href="${SITE_URL}/#/cancel/${booking.id}?token=${booking.cancelToken || ''}" style="color: #ef4444;">
              Cliquez ici
            </a>
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #1e293b; padding: 30px; text-align: center;">
        <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">
          À très bientôt ! 🐾
        </p>
        <p style="color: #64748b; margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} Maison pour Pets
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }),

  /**
   * Email de rechazo (al cliente)
   */
  bookingRejected: (booking, reason) => ({
    subject: `❌ Réservation non disponible - Maison pour Pets`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🐾 Maison pour Pets</h1>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Bonjour ${booking.contact?.name} 😔</h2>

        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          Nous sommes désolés de vous informer que nous ne pouvons pas accepter votre demande de réservation pour les dates suivantes :
        </p>

        <!-- Booking Details -->
        <div style="background-color: #fef2f2; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #ef4444;">
          <p style="color: #991b1b; margin: 0 0 10px 0; font-size: 14px;">
            <strong>Dates demandées :</strong> ${formatDateRange(booking.date, booking.endDate)}
          </p>
          <p style="color: #991b1b; margin: 0; font-size: 14px;">
            <strong>Raison :</strong> ${reason || 'Capacité complète pour ces dates'}
          </p>
        </div>

        <!-- Important Notice -->
        <div style="background-color: #f0fdf4; border-radius: 8px; padding: 15px 20px; margin-bottom: 25px;">
          <p style="color: #166534; margin: 0; font-size: 14px;">
            ✅ <strong>Aucun prélèvement n'a été effectué</strong> sur votre carte bancaire.
          </p>
        </div>

        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          Nous vous invitons à essayer d'autres dates. Nous serions ravis d'accueillir vos compagnons à une autre occasion !
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${SITE_URL}/#/services"
             style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Réessayer une autre date
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #1e293b; padding: 30px; text-align: center;">
        <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">
          Merci de votre compréhension 🙏
        </p>
        <p style="color: #64748b; margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} Maison pour Pets
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }),

  /**
   * Email de cancelación confirmada (al cliente)
   */
  bookingCancelled: (booking, refundAmount) => ({
    subject: `🔄 Réservation annulée - Remboursement en cours`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
        <div style="font-size: 60px; margin-bottom: 10px;">🔄</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Annulation Confirmée</h1>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Bonjour ${booking.contact?.name}</h2>

        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          Votre réservation a été annulée avec succès. ${refundAmount > 0 ? 'Un remboursement a été initié.' : ''}
        </p>

        <!-- Refund Info -->
        ${refundAmount > 0 ? `
        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center;">
          <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 18px;">💰 Remboursement</h3>
          <p style="color: #059669; font-size: 32px; font-weight: 700; margin: 0;">${refundAmount.toFixed(2)} €</p>
          <p style="color: #065f46; font-size: 14px; margin: 10px 0 0 0;">
            Le montant sera crédité sous 5-10 jours ouvrés
          </p>
        </div>
        ` : ''}

        <!-- Cancelled Booking Details -->
        <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
          <h4 style="color: #64748b; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Réservation annulée</h4>
          <p style="color: #1e293b; margin: 0; font-size: 14px;">
            ${booking.serviceName || booking.serviceId} • ${formatDateRange(booking.date, booking.endDate)}
          </p>
        </div>

        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          Nous espérons vous revoir bientôt ! N'hésitez pas à refaire une réservation quand vous le souhaitez.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${SITE_URL}/#/services"
             style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Faire une nouvelle réservation
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #1e293b; padding: 30px; text-align: center;">
        <p style="color: #64748b; margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} Maison pour Pets
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }),

  /**
   * Email de nueva reserva (al admin)
   */
  adminNewBooking: (booking) => ({
    subject: `🔔 Nueva reserva pendiente - ${booking.contact?.name}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f1f5f9;">
  <div style="max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: #f59e0b; color: #fff; padding: 20px; text-align: center;">
      <h2 style="margin: 0;">🔔 Nueva Reserva Pendiente</h2>
    </div>
    <div style="padding: 25px;">
      <table width="100%" cellpadding="8">
        <tr><td><strong>Cliente:</strong></td><td>${booking.contact?.name}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${booking.contact?.email}</td></tr>
        <tr><td><strong>Teléfono:</strong></td><td>${booking.contact?.phone || 'No proporcionado'}</td></tr>
        <tr><td><strong>Servicio:</strong></td><td>${booking.serviceName || booking.serviceId}</td></tr>
        <tr><td><strong>Fechas:</strong></td><td>${formatDateRange(booking.date, booking.endDate)}</td></tr>
        <tr><td><strong>Horarios:</strong></td><td>${booking.arrivalTime} - ${booking.departureTime}</td></tr>
        <tr><td><strong>Mascotas:</strong></td><td>${booking.quantity}</td></tr>
        <tr><td><strong>Total:</strong></td><td style="font-size: 18px; color: #059669; font-weight: bold;">${booking.total?.toFixed(2)} €</td></tr>
      </table>

      ${booking.details?.length > 0 ? `
      <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px;">
        <strong>Mascotas:</strong><br>
        ${booking.details.map(p => `• ${p.name} (${p.breed}, ${p.age} años)`).join('<br>')}
      </div>
      ` : ''}

      <div style="margin-top: 25px; text-align: center;">
        <a href="${SITE_URL}/#/admin" style="display: inline-block; background: #059669; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Ver en Admin Panel
        </a>
      </div>
    </div>
  </div>
</body>
</html>
    `
  })
};

/**
 * Helper: Formatear rango de fechas
 */
function formatDateRange(startDate, endDate) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const start = new Date(startDate).toLocaleDateString('fr-FR', options);

  if (!endDate || startDate === endDate) {
    return start;
  }

  const end = new Date(endDate).toLocaleDateString('fr-FR', options);
  return `${start} → ${end}`;
}

/**
 * Enviar email de solicitud recibida
 */
export const sendBookingReceivedEmail = async (req, res) => {
  try {
    const { booking } = req.body;

    if (!booking?.contact?.email) {
      return res.status(400).json({ error: 'Email del cliente requerido' });
    }

    const template = emailTemplates.bookingReceived(booking);

    // Email al cliente
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contact.email,
      subject: template.subject,
      html: template.html
    });

    // Email al admin
    const adminTemplate = emailTemplates.adminNewBooking(booking);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: adminTemplate.subject,
      html: adminTemplate.html
    });

    console.log(`✅ Emails enviados: booking received - ${booking.contact.email}`);
    res.json({ success: true, message: 'Emails enviados correctamente' });

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({ error: 'Error enviando email', details: error.message });
  }
};

/**
 * Enviar email de confirmación
 */
export const sendBookingConfirmedEmail = async (req, res) => {
  try {
    const { booking } = req.body;

    if (!booking?.contact?.email) {
      return res.status(400).json({ error: 'Email del cliente requerido' });
    }

    const template = emailTemplates.bookingConfirmed(booking);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contact.email,
      subject: template.subject,
      html: template.html
    });

    console.log(`✅ Email enviado: booking confirmed - ${booking.contact.email}`);
    res.json({ success: true });

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({ error: 'Error enviando email', details: error.message });
  }
};

/**
 * Enviar email de rechazo
 */
export const sendBookingRejectedEmail = async (req, res) => {
  try {
    const { booking, reason } = req.body;

    if (!booking?.contact?.email) {
      return res.status(400).json({ error: 'Email del cliente requerido' });
    }

    const template = emailTemplates.bookingRejected(booking, reason);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contact.email,
      subject: template.subject,
      html: template.html
    });

    console.log(`✅ Email enviado: booking rejected - ${booking.contact.email}`);
    res.json({ success: true });

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({ error: 'Error enviando email', details: error.message });
  }
};

/**
 * Enviar email de cancelación
 */
export const sendBookingCancelledEmail = async (req, res) => {
  try {
    const { booking, refundAmount = 0 } = req.body;

    if (!booking?.contact?.email) {
      return res.status(400).json({ error: 'Email del cliente requerido' });
    }

    const template = emailTemplates.bookingCancelled(booking, refundAmount);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.contact.email,
      subject: template.subject,
      html: template.html
    });

    console.log(`✅ Email enviado: booking cancelled - ${booking.contact.email}`);
    res.json({ success: true });

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({ error: 'Error enviando email', details: error.message });
  }
};

export default {
  sendBookingReceivedEmail,
  sendBookingConfirmedEmail,
  sendBookingRejectedEmail,
  sendBookingCancelledEmail
};
