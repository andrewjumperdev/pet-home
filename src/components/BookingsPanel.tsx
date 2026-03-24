import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || "https://api.maisonpourpets.com";
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || "";

import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
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
          status: booking.status || 'pending',
        };
      });
      setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des réservations.');
    } finally {
      setLoading(false);
    }
  }

  // ── Backend-driven confirm/reject/resend ────────────────────────────────────

  async function confirmBooking(bookingId: string) {
    try {
      setActionLoading(bookingId);
      const res = await axios.post(
        `${API}/api/bookings/confirm`,
        { bookingId },
        { headers: { "x-api-key": ADMIN_API_KEY } }
      );
      setBookings(prev =>
        prev.map(b => b.id === bookingId
          ? { ...b, status: 'confirmed' as BookingStatus, confirmedAt: new Date().toISOString(), ...(res.data.emailStatus && { emailStatus: res.data.emailStatus }) }
          : b
        )
      );
      const emailMsg = res.data.emailStatus === 'failed'
        ? '\n⚠️ Email non envoyé — utilisez "Renvoyer email".'
        : '\n✅ Email envoyé au client.';
      alert(`Réservation confirmée et paiement encaissé.${emailMsg}`);
    } catch (err: any) {
      alert(`Erreur : ${err.response?.data?.error || err.message}`);
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectBooking(bookingId: string, reason: string = '') {
    try {
      setActionLoading(bookingId);
      const res = await axios.post(
        `${API}/api/bookings/reject`,
        { bookingId, reason },
        { headers: { "x-api-key": ADMIN_API_KEY } }
      );
      setBookings(prev =>
        prev.map(b => b.id === bookingId
          ? { ...b, status: 'rejected' as BookingStatus, rejectedAt: new Date().toISOString(), rejectionReason: reason }
          : b
        )
      );
      const emailMsg = res.data.emailStatus === 'failed'
        ? '\n⚠️ Email non envoyé.'
        : '\n✅ Email envoyé au client.';
      alert(`Réservation refusée.${emailMsg}`);
    } catch (err: any) {
      alert(`Erreur : ${err.response?.data?.error || err.message}`);
    } finally {
      setActionLoading(null);
    }
  }

  async function resendEmail(bookingId: string, type: 'confirmed' | 'rejected') {
    try {
      setActionLoading(bookingId);
      await axios.post(
        `${API}/api/bookings/resend-email`,
        { bookingId, type },
        { headers: { "x-api-key": ADMIN_API_KEY } }
      );
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, emailStatus: 'sent' } : b)
      );
      alert('Email renvoyé avec succès.');
    } catch (err: any) {
      alert(`Erreur lors du renvoi : ${err.response?.data?.error || err.message}`);
    } finally {
      setActionLoading(null);
    }
  }

  const handleReject = (bookingId: string) => {
    const reason = prompt('Motif du refus (optionnel) :');
    if (reason !== null) {
      rejectBooking(bookingId, reason);
    }
  };

  // ── Statistics ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const rejected = bookings.filter(b => b.status === 'rejected').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.total || 0), 0);

    return { pending, confirmed, rejected, totalRevenue };
  }, [bookings]);

  const getAvailabilityForDate = (date: string) => {
    const confirmedBookings = bookings.filter(
      b => b.date === date && b.status === 'confirmed'
    );
    const totalQuantity = confirmedBookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
    const available = MAX_CAPACITY_PER_DAY - totalQuantity;
    return { available, total: MAX_CAPACITY_PER_DAY, booked: totalQuantity };
  };

  // ── Filtering ───────────────────────────────────────────────────────────────

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
        label: 'En attente'
      },
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Confirmée'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        label: 'Refusée'
      },
      cancelled: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: XCircle,
        label: 'Annulée'
      }
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">En attente</p>
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
              <p className="text-sm font-medium text-green-600">Confirmées</p>
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
              <p className="text-sm font-medium text-red-600">Refusées</p>
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
              <p className="text-sm font-medium text-blue-600">Revenus</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalRevenue.toFixed(0)}€</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <TrendingUp className="text-blue-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par client, email ou date..."
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
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmées</option>
              <option value="rejected">Refusées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking list */}
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
          <p className="text-gray-500 font-medium">Aucune réservation trouvée.</p>
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

                      <div className="flex items-center gap-2 flex-wrap">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => confirmBooking(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle size={18} />
                              <span className="hidden sm:inline">Confirmer</span>
                            </button>
                            <button
                              onClick={() => handleReject(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle size={18} />
                              <span className="hidden sm:inline">Refuser</span>
                            </button>
                          </>
                        )}
                        {(booking as any).emailStatus === 'failed' && (
                          <button
                            onClick={() => resendEmail(booking.id, booking.status as 'confirmed' | 'rejected')}
                            disabled={actionLoading === booking.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-xs font-medium transition"
                          >
                            <Mail size={14} />
                            Renvoyer email
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Quick info */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Dates</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {(booking as any).startDate
                            ? `${new Date((booking as any).startDate).toLocaleDateString('fr-FR')} → ${new Date((booking as any).endDate || (booking as any).startDate).toLocaleDateString('fr-FR')}`
                            : new Date(booking.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Animaux</p>
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
                        <p className="text-xs text-gray-500 mb-1">Disponibilité</p>
                        <p className={`text-sm font-semibold ${availability.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {availability.available}/{availability.total} libres
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
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
                            <h4 className="font-semibold text-gray-900 mb-2">Détails des animaux</h4>
                            <div className="space-y-2">
                              {booking.details.map((pet, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
                                  <p className="font-medium text-gray-900">{pet.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {pet.breed} · {pet.age} ans
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {(booking.arrivalTime || booking.departureTime) && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Horaires</h4>
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-600">
                                  Arrivée : <span className="font-medium text-gray-900">{booking.arrivalTime || 'Non précisée'}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                  Départ : <span className="font-medium text-gray-900">{booking.departureTime || 'Non précisé'}</span>
                                </p>
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Informations complémentaires</h4>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                              <p className="text-sm text-gray-600">
                                Créé le : <span className="font-medium text-gray-900">{new Date(booking.createdAt).toLocaleString('fr-FR')}</span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Payment ID : <span className="font-mono text-xs text-gray-900">{booking.paymentId}</span>
                              </p>
                              {(booking as any).emailStatus && (
                                <p className="text-sm text-gray-600">
                                  Email : <span className={`font-medium ${(booking as any).emailStatus === 'sent' ? 'text-green-700' : 'text-orange-600'}`}>
                                    {(booking as any).emailStatus === 'sent' ? 'Envoyé' : 'Non envoyé'}
                                  </span>
                                </p>
                              )}
                              {booking.confirmedAt && (
                                <p className="text-sm text-gray-600">
                                  Confirmé le : <span className="font-medium text-green-700">{new Date(booking.confirmedAt).toLocaleString('fr-FR')}</span>
                                </p>
                              )}
                              {booking.rejectedAt && (
                                <p className="text-sm text-gray-600">
                                  Refusé le : <span className="font-medium text-red-700">{new Date(booking.rejectedAt).toLocaleString('fr-FR')}</span>
                                </p>
                              )}
                              {booking.rejectionReason && (
                                <p className="text-sm text-gray-600">
                                  Motif : <span className="font-medium text-red-700">{booking.rejectionReason}</span>
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
