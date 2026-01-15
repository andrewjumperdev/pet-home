import { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Dog,
  Cat,
  Euro,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingDetailModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function BookingDetailModal({
  booking,
  isOpen,
  onClose,
  onUpdate
}: BookingDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDate, setEditedDate] = useState(booking?.date || '');
  const [editedArrivalTime, setEditedArrivalTime] = useState(booking?.arrivalTime || '');
  const [editedDepartureTime, setEditedDepartureTime] = useState(booking?.departureTime || '');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Actualizar estados cuando cambia el booking
  useEffect(() => {
    if (booking) {
      setEditedDate(booking.date);
      setEditedArrivalTime(booking.arrivalTime || '');
      setEditedDepartureTime(booking.departureTime || '');
      setIsEditing(false);
    }
  }, [booking]);

  if (!booking) return null;

  const isPet = booking.serviceId === 'felin' || booking.serviceId === '3';

  const getStatusConfig = (status: BookingStatus) => {
    const configs = {
      pending: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Pendiente'
      },
      confirmed: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Confirmada'
      },
      rejected: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: XCircle,
        label: 'Rechazada'
      },
      cancelled: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        icon: XCircle,
        label: 'Cancelada'
      }
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  async function handleConfirm() {
    try {
      setActionLoading('confirm');

      // Si hay un paymentMethodId, procesar el pago
      if (booking.paymentMethodId && booking.paymentStatus === 'pending') {
        const confirmPayment = confirm(
          `¿Confirmar la reserva y cobrar ${booking.total?.toFixed(2)}€ a la tarjeta del cliente?`
        );

        if (!confirmPayment) {
          setActionLoading(null);
          return;
        }

        // Llamar al backend para procesar el pago
        try {
          const response = await fetch('https://api.maisonpourpets.com/charge-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingId: booking.id,
              paymentMethodId: booking.paymentMethodId,
              amount: Math.round((booking.total || 0) * 100),
              client_email: booking.contact.email,
              client_name: booking.contact.name,
            }),
          });

          const data = await response.json();

          if (!response.ok || data.error) {
            throw new Error(data.error || 'Error al procesar el pago');
          }

          // Actualizar la reserva con el pago confirmado
          const bookingRef = doc(db, 'bookings', booking.id);
          await updateDoc(bookingRef, {
            status: 'confirmed',
            confirmedAt: new Date().toISOString(),
            paymentId: data.paymentIntentId,
            paymentStatus: 'paid',
          });

          alert(`Reserva confirmada y pago de ${booking.total?.toFixed(2)}€ procesado con éxito`);
        } catch (paymentError: any) {
          console.error('Error processing payment:', paymentError);
          alert(`Error al procesar el pago: ${paymentError.message}. La reserva NO ha sido confirmada.`);
          setActionLoading(null);
          return;
        }
      } else {
        // Si no hay método de pago o ya está pagado, solo confirmar
        const bookingRef = doc(db, 'bookings', booking.id);
        await updateDoc(bookingRef, {
          status: 'confirmed',
          confirmedAt: new Date().toISOString()
        });
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Error al confirmar la reserva');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject() {
    const reason = prompt('¿Por qué rechazas esta reserva? (opcional)');
    if (reason === null) return;

    try {
      setActionLoading('reject');
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Error al rechazar la reserva');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSaveEdit() {
    try {
      setActionLoading('save');
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        date: editedDate,
        arrivalTime: editedArrivalTime,
        departureTime: editedDepartureTime,
      });
      setIsEditing(false);
      onUpdate();
      alert('Reserva actualizada con éxito');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error al actualizar la reserva');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reserva? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setActionLoading('delete');
      // En lugar de eliminar, cambiar a cancelada
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        status: 'cancelled',
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error al eliminar la reserva');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              {/* Header */}
              <div className={`${statusConfig.bg} ${statusConfig.border} border-b p-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${statusConfig.bg} border-2 ${statusConfig.border}`}>
                      {isPet ? (
                        <Cat size={32} className="text-purple-600" />
                      ) : (
                        <Dog size={32} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {booking.details[0]?.name || 'Reserva'}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                          <StatusIcon size={16} />
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Cliente */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User size={20} className="text-blue-600" />
                    Información del Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Nombre</p>
                        <p className="font-semibold text-gray-900">{booking.contact.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-semibold text-gray-900">{booking.contact.email}</p>
                      </div>
                    </div>
                    {booking.contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Teléfono</p>
                          <p className="font-semibold text-gray-900">{booking.contact.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fecha y Horarios */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-600" />
                    Fecha y Horarios
                    {!isEditing && booking.status === 'pending' && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="ml-auto text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Fecha</p>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedDate}
                          onChange={(e) => setEditedDate(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Hora de llegada</p>
                      {isEditing ? (
                        <input
                          type="time"
                          value={editedArrivalTime}
                          onChange={(e) => setEditedArrivalTime(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">{booking.arrivalTime || 'No especificada'}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Hora de salida</p>
                      {isEditing ? (
                        <input
                          type="time"
                          value={editedDepartureTime}
                          onChange={(e) => setEditedDepartureTime(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">{booking.departureTime || 'No especificada'}</p>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleSaveEdit}
                        disabled={actionLoading === 'save'}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                      >
                        <Save size={16} />
                        Guardar cambios
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedDate(booking.date);
                          setEditedArrivalTime(booking.arrivalTime || '');
                          setEditedDepartureTime(booking.departureTime || '');
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {/* Mascotas */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    {isPet ? <Cat size={20} className="text-purple-600" /> : <Dog size={20} className="text-blue-600" />}
                    Mascotas ({booking.quantity})
                  </h3>
                  <div className="space-y-3">
                    {booking.details.map((pet, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{pet.name}</p>
                            <p className="text-sm text-gray-600">{pet.breed}</p>
                            <p className="text-xs text-gray-500 mt-1">{pet.age} años</p>
                          </div>
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                            {booking.sizes[idx] || 'Tamaño no especificado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {booking.isSterilized !== undefined && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      {booking.isSterilized ? (
                        <span className="text-green-700">✓ Esterilizada</span>
                      ) : (
                        <span className="text-gray-600">No esterilizada</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Pago */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CreditCard size={20} className="text-green-600" />
                    Información de Pago
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Pagado</p>
                      <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                        <Euro size={20} />
                        {booking.total?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">ID de Pago</p>
                      <p className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded border border-green-200">
                        {booking.paymentId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={20} className="text-gray-600" />
                    Información Adicional
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Creado:</strong>{' '}
                      {new Date(booking.createdAt).toLocaleString('es-ES')}
                    </p>
                    {booking.confirmedAt && (
                      <p>
                        <strong className="text-green-700">Confirmado:</strong>{' '}
                        {new Date(booking.confirmedAt).toLocaleString('es-ES')}
                      </p>
                    )}
                    {booking.rejectedAt && (
                      <p>
                        <strong className="text-red-700">Rechazado:</strong>{' '}
                        {new Date(booking.rejectedAt).toLocaleString('es-ES')}
                      </p>
                    )}
                    {booking.rejectionReason && (
                      <p className="text-red-700">
                        <strong>Razón del rechazo:</strong> {booking.rejectionReason}
                      </p>
                    )}
                    <p>
                      <strong>ID de Servicio:</strong> {booking.serviceId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex flex-wrap gap-3 justify-end">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={handleConfirm}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                      >
                        <CheckCircle size={20} />
                        Confirmar Reserva
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                      >
                        <XCircle size={20} />
                        Rechazar
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    <Trash2 size={20} />
                    Eliminar
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
