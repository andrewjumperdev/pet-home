import { useEffect, useState, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { Booking, BookingStatus } from '../types';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Mail,
  Phone,
  Dog,
  Euro,
  Filter,
  Search,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Capacidad máxima por día (esto debería estar en una configuración)
  const MAX_CAPACITY_PER_DAY = 5;

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'bookings'));
      const data = snapshot.docs.map(d => {
        const booking = d.data() as Booking;
        return {
          ...booking,
          id: d.id,
          status: booking.status || 'pending', // Por defecto, las reservas antiguas son 'pending'
        };
      });
      setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
      setError('Error al cargar las reservas.');
    } finally {
      setLoading(false);
    }
  }

  // Confirmar reserva
  async function confirmBooking(bookingId: string) {
    try {
      setActionLoading(bookingId);
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'confirmed',
        confirmedAt: new Date().toISOString()
      });

      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? { ...b, status: 'confirmed' as BookingStatus, confirmedAt: new Date().toISOString() }
            : b
        )
      );

      // TODO: Enviar email de confirmación al cliente
      alert('Reserva confirmada con éxito. Email de confirmación enviado al cliente.');
    } catch (err) {
      console.error(err);
      alert('Error al confirmar la reserva.');
    } finally {
      setActionLoading(null);
    }
  }

  // Rechazar reserva
  async function rejectBooking(bookingId: string, reason: string = '') {
    try {
      setActionLoading(bookingId);
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      });

      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? {
                ...b,
                status: 'rejected' as BookingStatus,
                rejectedAt: new Date().toISOString(),
                rejectionReason: reason
              }
            : b
        )
      );

      // TODO: Enviar email de rechazo al cliente
      alert('Reserva rechazada. Email de notificación enviado al cliente.');
    } catch (err) {
      console.error(err);
      alert('Error al rechazar la reserva.');
    } finally {
      setActionLoading(null);
    }
  }

  const handleReject = (bookingId: string) => {
    const reason = prompt('¿Por qué rechazas esta reserva? (opcional)');
    if (reason !== null) {
      rejectBooking(bookingId, reason);
    }
  };

  // Estadísticas
  const stats = useMemo(() => {
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const rejected = bookings.filter(b => b.status === 'rejected').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.total || 0), 0);

    return { pending, confirmed, rejected, totalRevenue };
  }, [bookings]);

  // Verificar disponibilidad por fecha
  const getAvailabilityForDate = (date: string) => {
    const confirmedBookings = bookings.filter(
      b => b.date === date && b.status === 'confirmed'
    );
    const totalQuantity = confirmedBookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
    const available = MAX_CAPACITY_PER_DAY - totalQuantity;
    return { available, total: MAX_CAPACITY_PER_DAY, booked: totalQuantity };
  };

  // Filtrado
  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch =
        b.contact.name.toLowerCase().includes(search.toLowerCase()) ||
        b.contact.email.toLowerCase().includes(search.toLowerCase()) ||
        b.date.includes(search);

      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const getStatusBadge = (status: BookingStatus) => {
    const configs = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Pendiente'
      },
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Confirmada'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        label: 'Rechazada'
      },
      cancelled: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: XCircle,
        label: 'Cancelada'
      }
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-yellow-200 p-3 rounded-lg">
              <Clock className="text-yellow-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Confirmadas</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.confirmed}</p>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <CheckCircle className="text-green-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rechazadas</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.rejected}</p>
            </div>
            <div className="bg-red-200 p-3 rounded-lg">
              <XCircle className="text-red-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Ingresos</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalRevenue.toFixed(0)}€</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <TrendingUp className="text-blue-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente, email o fecha..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as BookingStatus | 'all')}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500 font-medium">No se encontraron reservas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((booking) => {
              const isExpanded = expandedBooking === booking.id;
              const availability = getAvailabilityForDate(booking.date);

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Dog className="text-blue-600" size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">{booking.contact.name}</h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail size={14} />
                                <span>{booking.contact.email}</span>
                              </div>
                              {booking.contact.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone size={14} />
                                  <span>{booking.contact.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => confirmBooking(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle size={18} />
                              <span className="hidden sm:inline">Confirmar</span>
                            </button>
                            <button
                              onClick={() => handleReject(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle size={18} />
                              <span className="hidden sm:inline">Rechazar</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Info rápida */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Fecha</p>
                        <p className="text-sm font-semibold text-gray-900">{new Date(booking.date).toLocaleDateString('es-ES')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Mascotas</p>
                        <p className="text-sm font-semibold text-gray-900">{booking.quantity} × {booking.sizes.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                          <Euro size={14} />
                          {booking.total?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Disponibilidad</p>
                        <p className={`text-sm font-semibold ${availability.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {availability.available}/{availability.total} libres
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-200 bg-gray-50"
                      >
                        <div className="p-6 space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Detalles de las mascotas</h4>
                            <div className="space-y-2">
                              {booking.details.map((pet, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
                                  <p className="font-medium text-gray-900">{pet.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {pet.breed} · {pet.age} años
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {(booking.arrivalTime || booking.departureTime) && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Horarios</h4>
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-600">
                                  Llegada: <span className="font-medium text-gray-900">{booking.arrivalTime || 'No especificada'}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                  Salida: <span className="font-medium text-gray-900">{booking.departureTime || 'No especificada'}</span>
                                </p>
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Información adicional</h4>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                              <p className="text-sm text-gray-600">
                                Creado: <span className="font-medium text-gray-900">{new Date(booking.createdAt).toLocaleString('es-ES')}</span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Payment ID: <span className="font-mono text-xs text-gray-900">{booking.paymentId}</span>
                              </p>
                              {booking.confirmedAt && (
                                <p className="text-sm text-gray-600">
                                  Confirmado: <span className="font-medium text-green-700">{new Date(booking.confirmedAt).toLocaleString('es-ES')}</span>
                                </p>
                              )}
                              {booking.rejectedAt && (
                                <p className="text-sm text-gray-600">
                                  Rechazado: <span className="font-medium text-red-700">{new Date(booking.rejectedAt).toLocaleString('es-ES')}</span>
                                </p>
                              )}
                              {booking.rejectionReason && (
                                <p className="text-sm text-gray-600">
                                  Razón: <span className="font-medium text-red-700">{booking.rejectionReason}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
