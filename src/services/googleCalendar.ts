import { Booking } from '../types';

/**
 * Servicio de integración con Google Calendar
 *
 * Este servicio maneja la sincronización bidireccional entre las reservas
 * de Firestore y Google Calendar.
 */

// Configuración de Google Calendar API
const CALENDAR_ID = 'primary'; // Puedes cambiarlo por un calendar ID específico
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  colorId?: string;
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

/**
 * Inicializar el cliente de Google Calendar
 * Requiere configuración previa en Firebase Console:
 * 1. Habilitar Google Calendar API en Google Cloud Console
 * 2. Agregar credenciales OAuth 2.0
 * 3. Configurar redirect URIs
 */
export async function initGoogleCalendar() {
  // @ts-ignore
  if (typeof gapi === 'undefined') {
    console.error('Google API client not loaded');
    return false;
  }

  try {
    // @ts-ignore
    await gapi.client.init({
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      scope: SCOPES,
    });

    return true;
  } catch (error) {
    console.error('Error initializing Google Calendar:', error);
    return false;
  }
}

/**
 * Solicitar autorización del usuario para acceder a Google Calendar
 */
export async function signInToGoogle() {
  try {
    // @ts-ignore
    const result = await gapi.auth2.getAuthInstance().signIn();
    return result.isSignedIn();
  } catch (error) {
    console.error('Error signing in to Google:', error);
    return false;
  }
}

/**
 * Cerrar sesión de Google
 */
export async function signOutFromGoogle() {
  try {
    // @ts-ignore
    await gapi.auth2.getAuthInstance().signOut();
    return true;
  } catch (error) {
    console.error('Error signing out from Google:', error);
    return false;
  }
}

/**
 * Verificar si el usuario está autenticado
 */
export function isGoogleSignedIn(): boolean {
  try {
    // @ts-ignore
    return gapi.auth2.getAuthInstance().isSignedIn.get();
  } catch (error) {
    return false;
  }
}

/**
 * Convertir una reserva de Firestore a un evento de Google Calendar
 */
function bookingToCalendarEvent(booking: Booking): GoogleCalendarEvent {
  const petNames = booking.details.map(d => d.name).join(', ');
  const petTypes = booking.details.map(d => d.breed).join(', ');

  // Determinar el color según el estado
  const colorMap = {
    pending: '5',    // Amarillo
    confirmed: '10', // Verde
    rejected: '11',  // Rojo
    cancelled: '8'   // Gris
  };

  // Crear fecha y hora
  const date = new Date(booking.date);
  const startTime = booking.arrivalTime || '09:00';
  const endTime = booking.departureTime || '18:00';

  const startDateTime = new Date(`${booking.date}T${startTime}`);
  const endDateTime = new Date(`${booking.date}T${endTime}`);

  return {
    summary: `${booking.status === 'confirmed' ? '✅' : booking.status === 'pending' ? '⏳' : '❌'} ${petNames} (${booking.contact.name})`,
    description: `
🐾 Reserva de ${booking.quantity} mascota(s)

📋 Detalles:
${booking.details.map(pet => `- ${pet.name} (${pet.breed}, ${pet.age} años)`).join('\n')}

👤 Cliente: ${booking.contact.name}
📧 Email: ${booking.contact.email}
📞 Teléfono: ${booking.contact.phone || 'No especificado'}

📏 Tamaños: ${booking.sizes.join(', ')}
💰 Total: ${booking.total?.toFixed(2) || '0.00'}€
🔖 Estado: ${booking.status.toUpperCase()}

${booking.isSterilized ? '✅ Esterilizada' : '❌ No esterilizada'}

🆔 ID de pago: ${booking.paymentId}
📅 Creado: ${new Date(booking.createdAt).toLocaleString('es-ES')}

${booking.rejectionReason ? `❌ Razón de rechazo: ${booking.rejectionReason}` : ''}
    `.trim(),
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Europe/Paris',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Europe/Paris',
    },
    colorId: colorMap[booking.status],
    extendedProperties: {
      private: {
        bookingId: booking.id,
        firebaseId: booking.id,
        status: booking.status,
        total: booking.total?.toString() || '0',
      }
    }
  };
}

/**
 * Crear un evento en Google Calendar desde una reserva
 */
export async function createCalendarEvent(booking: Booking): Promise<string | null> {
  if (!isGoogleSignedIn()) {
    console.error('User not signed in to Google');
    return null;
  }

  try {
    const event = bookingToCalendarEvent(booking);

    // @ts-ignore
    const response = await gapi.client.calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });

    console.log('Event created:', response.result.id);
    return response.result.id;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}

/**
 * Actualizar un evento existente en Google Calendar
 */
export async function updateCalendarEvent(
  eventId: string,
  booking: Booking
): Promise<boolean> {
  if (!isGoogleSignedIn()) {
    console.error('User not signed in to Google');
    return false;
  }

  try {
    const event = bookingToCalendarEvent(booking);

    // @ts-ignore
    await gapi.client.calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: eventId,
      resource: event,
    });

    console.log('Event updated:', eventId);
    return true;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return false;
  }
}

/**
 * Eliminar un evento de Google Calendar
 */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  if (!isGoogleSignedIn()) {
    console.error('User not signed in to Google');
    return false;
  }

  try {
    // @ts-ignore
    await gapi.client.calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });

    console.log('Event deleted:', eventId);
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}

/**
 * Obtener todos los eventos de un rango de fechas
 */
export async function getCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<GoogleCalendarEvent[]> {
  if (!isGoogleSignedIn()) {
    console.error('User not signed in to Google');
    return [];
  }

  try {
    // @ts-ignore
    const response = await gapi.client.calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.result.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

/**
 * Sincronizar una reserva con Google Calendar
 * - Si no existe en Google Calendar, la crea
 * - Si existe, la actualiza
 */
export async function syncBookingToCalendar(
  booking: Booking,
  existingEventId?: string
): Promise<string | null> {
  if (existingEventId) {
    const updated = await updateCalendarEvent(existingEventId, booking);
    return updated ? existingEventId : null;
  } else {
    return await createCalendarEvent(booking);
  }
}

/**
 * Sincronizar todas las reservas con Google Calendar
 */
export async function syncAllBookingsToCalendar(
  bookings: Booking[],
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < bookings.length; i++) {
    const booking = bookings[i];
    const eventId = await createCalendarEvent(booking);

    if (eventId) {
      success++;
    } else {
      failed++;
    }

    if (onProgress) {
      onProgress(i + 1, bookings.length);
    }

    // Pequeño delay para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return { success, failed };
}

/**
 * Buscar un evento en Google Calendar por ID de reserva
 */
export async function findEventByBookingId(
  bookingId: string,
  startDate: Date,
  endDate: Date
): Promise<GoogleCalendarEvent | null> {
  const events = await getCalendarEvents(startDate, endDate);

  const event = events.find(
    e => e.extendedProperties?.private?.bookingId === bookingId
  );

  return event || null;
}
