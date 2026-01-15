import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Booking, BookingStatus } from '../types';
import BookingDetailModal from './BookingDetailModal';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Dog,
  Cat,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  LayoutGrid,
  List,
  CalendarDays,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'month' | 'week' | 'day';

interface DayBooking {
  date: string;
  bookings: Booking[];
  capacity: {
    total: number;
    used: number;
    pending: number;
    confirmed: number;
  };
}

export default function CalendarDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  const MAX_CAPACITY = 5;

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'bookings'));
      const data = snapshot.docs.map(d => ({
        ...(d.data() as Booking),
        id: d.id,
        status: d.data().status || 'pending',
      }));
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();

    if (!draggedBooking || draggedBooking.date === targetDate) {
      setDraggedBooking(null);
      return;
    }

    if (!confirm(`¿Mover la reserva de ${draggedBooking.details[0]?.name} al ${new Date(targetDate).toLocaleDateString('es-ES')}?`)) {
      setDraggedBooking(null);
      return;
    }

    try {
      const bookingRef = doc(db, 'bookings', draggedBooking.id);
      await updateDoc(bookingRef, {
        date: targetDate
      });

      // Actualizar localmente
      setBookings(prev =>
        prev.map(b =>
          b.id === draggedBooking.id ? { ...b, date: targetDate } : b
        )
      );

      alert('Reserva movida con éxito');
    } catch (error) {
      console.error('Error moving booking:', error);
      alert('Error al mover la reserva');
    } finally {
      setDraggedBooking(null);
    }
  };

  // Agrupar reservas por fecha
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, DayBooking> = {};

    bookings.forEach(booking => {
      const dateKey = booking.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          bookings: [],
          capacity: {
            total: MAX_CAPACITY,
            used: 0,
            pending: 0,
            confirmed: 0
          }
        };
      }

      grouped[dateKey].bookings.push(booking);

      if (booking.status === 'confirmed') {
        grouped[dateKey].capacity.confirmed += booking.quantity || 1;
        grouped[dateKey].capacity.used += booking.quantity || 1;
      } else if (booking.status === 'pending') {
        grouped[dateKey].capacity.pending += booking.quantity || 1;
      }
    });

    return grouped;
  }, [bookings]);

  // Obtener días según la vista
  const getDaysToShow = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();

    if (viewMode === 'month') {
      // Vista mensual
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days: (Date | null)[] = [];

      // Días vacíos al inicio
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }

      // Días del mes
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }

      return days;
    } else if (viewMode === 'week') {
      // Vista semanal
      const currentDayOfWeek = currentDate.getDay();
      const weekStart = new Date(currentDate);
      weekStart.setDate(day - currentDayOfWeek);

      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const weekDay = new Date(weekStart);
        weekDay.setDate(weekStart.getDate() + i);
        days.push(weekDay);
      }

      return days;
    } else {
      // Vista diaria
      return [currentDate];
    }
  };

  const days = getDaysToShow();

  const changeDate = (delta: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + delta);
      } else if (viewMode === 'week') {
        newDate.setDate(newDate.getDate() + (delta * 7));
      } else {
        newDate.setDate(newDate.getDate() + delta);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Obtener icono según tipo y tamaño
  const getAnimalIcon = (booking: Booking) => {
    const isPet = booking.serviceId === 'felin' || booking.serviceId === '3';
    const isLarge = booking.sizes.some(s => s.toLowerCase().includes('gros') || s.toLowerCase().includes('grand'));

    if (isPet) {
      return <Cat size={isLarge ? 18 : 14} className="text-purple-600" />;
    }
    return <Dog size={isLarge ? 18 : 14} className="text-blue-600" />;
  };

  // Obtener color según estado
  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      confirmed: 'bg-green-100 border-green-300 text-green-800',
      rejected: 'bg-red-100 border-red-300 text-red-800',
      cancelled: 'bg-gray-100 border-gray-300 text-gray-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: BookingStatus) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      rejected: XCircle,
      cancelled: XCircle
    };
    const Icon = icons[status];
    return <Icon size={12} />;
  };

  // Renderizar una reserva individual
  const renderBooking = (booking: Booking, index: number, compact: boolean = false) => {
    const petName = booking.details[0]?.name || 'Sin nombre';

    return (
      <motion.div
        key={booking.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        draggable
        onDragStart={(e) => handleDragStart(e, booking)}
        onClick={() => setSelectedBooking(booking)}
        className={`
          relative text-xs px-2 py-1 rounded border cursor-move
          transition-all duration-200
          ${getStatusColor(booking.status)}
          hover:scale-105 hover:shadow-md hover:z-10
        `}
      >
        <div className="flex items-center gap-1">
          {getAnimalIcon(booking)}
          {getStatusIcon(booking.status)}
          <span className="font-semibold truncate flex-1">{petName}</span>
          {!compact && <span className="text-xs opacity-75">×{booking.quantity}</span>}
        </div>
      </motion.div>
    );
  };

  // Renderizar día del calendario
  const renderDay = (date: Date | null, isWeekView: boolean = false) => {
    if (!date) {
      return <div className="aspect-square bg-gray-50"></div>;
    }

    const dateKey = date.toISOString().split('T')[0];
    const dayData = bookingsByDate[dateKey];
    const isToday = new Date().toDateString() === date.toDateString();

    // Filtrar por estado
    const filteredBookings = dayData?.bookings.filter(b =>
      statusFilter === 'all' || b.status === statusFilter
    ) || [];

    const confirmedCount = dayData?.capacity.confirmed || 0;
    const pendingCount = dayData?.capacity.pending || 0;
    const availableCount = MAX_CAPACITY - confirmedCount;
    const isFull = availableCount <= 0;

    const containerClass = isWeekView
      ? 'flex-1 border border-gray-200 p-3'
      : 'aspect-square border border-gray-200 p-2';

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, dateKey)}
        className={`
          ${containerClass} cursor-pointer
          transition-all duration-200 overflow-hidden
          ${isToday ? 'bg-blue-50 border-blue-400 border-2' : 'bg-white hover:bg-gray-50'}
          ${isFull ? 'bg-red-50' : ''}
          ${draggedBooking ? 'hover:bg-blue-100' : ''}
        `}
      >
        {/* Header del día */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
              {isWeekView ? date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }) : date.getDate()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isFull && <AlertCircle size={12} className="text-red-500" />}
            <span className={`text-xs font-bold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
              {availableCount}/{MAX_CAPACITY}
            </span>
          </div>
        </div>

        {/* Indicador de capacidad */}
        <div className="flex gap-0.5 mb-1">
          {Array.from({ length: MAX_CAPACITY }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < confirmedCount
                  ? 'bg-green-500'
                  : i < confirmedCount + pendingCount
                  ? 'bg-yellow-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Lista de reservas */}
        <div className={`space-y-1 overflow-y-auto ${isWeekView ? 'max-h-[500px]' : 'max-h-[calc(100%-3rem)]'}`}>
          {filteredBookings.length > (isWeekView ? 10 : 3) ? (
            <>
              {filteredBookings.slice(0, isWeekView ? 8 : 2).map((booking, idx) => renderBooking(booking, idx))}
              <div
                className="text-xs text-center bg-gray-100 rounded px-2 py-1 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => filteredBookings.forEach(b => setSelectedBooking(b))}
              >
                +{filteredBookings.length - (isWeekView ? 8 : 2)} más
              </div>
            </>
          ) : (
            filteredBookings.map((booking, idx) => renderBooking(booking, idx))
          )}
        </div>
      </motion.div>
    );
  };

  // Renderizar vista diaria
  const renderDayView = () => {
    const date = currentDate;
    const dateKey = date.toISOString().split('T')[0];
    const dayData = bookingsByDate[dateKey];
    const filteredBookings = dayData?.bookings.filter(b =>
      statusFilter === 'all' || b.status === statusFilter
    ) || [];

    const confirmedCount = dayData?.capacity.confirmed || 0;
    const availableCount = MAX_CAPACITY - confirmedCount;

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <span className={`text-lg font-bold ${availableCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {availableCount}/{MAX_CAPACITY} disponibles
            </span>
            <div className="flex gap-1">
              {Array.from({ length: MAX_CAPACITY }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-2 rounded-full ${
                    i < confirmedCount ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No hay reservas para este día</p>
            </div>
          ) : (
            filteredBookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                draggable
                onDragStart={(e) => handleDragStart(e, booking)}
                onClick={() => setSelectedBooking(booking)}
                className={`
                  p-4 rounded-lg border-2 cursor-move transition-all
                  ${getStatusColor(booking.status)}
                  hover:scale-102 hover:shadow-lg
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      {getAnimalIcon(booking)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{booking.details[0]?.name}</h3>
                      <p className="text-sm text-gray-600">{booking.contact.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{booking.arrivalTime} - {booking.departureTime}</p>
                    <p className="font-bold text-gray-900">{booking.quantity} mascota(s)</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Estadísticas del período
  const periodStats = useMemo(() => {
    let periodBookings = bookings;

    if (viewMode === 'month') {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      periodBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
    } else if (viewMode === 'week') {
      const currentDayOfWeek = currentDate.getDay();
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDayOfWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      periodBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= weekStart && bookingDate <= weekEnd;
      });
    } else {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      periodBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= dayStart && bookingDate <= dayEnd;
      });
    }

    return {
      total: periodBookings.length,
      pending: periodBookings.filter(b => b.status === 'pending').length,
      confirmed: periodBookings.filter(b => b.status === 'confirmed').length,
      rejected: periodBookings.filter(b => b.status === 'rejected').length,
      revenue: periodBookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.total || 0), 0)
    };
  }, [bookings, currentDate, viewMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Navegación de fecha */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center">
              {viewMode === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {viewMode === 'week' && `Semana del ${currentDate.toLocaleDateString('es-ES')}`}
              {viewMode === 'day' && currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Hoy
            </button>
          </div>

          {/* Vista y filtros */}
          <div className="flex items-center gap-3">
            {/* Toggle de vista */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-2 ${
                  viewMode === 'month' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                }`}
              >
                <LayoutGrid size={16} />
                <span className="text-sm font-medium">Mes</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-2 ${
                  viewMode === 'week' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                }`}
              >
                <CalendarDays size={16} />
                <span className="text-sm font-medium">Semana</span>
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-2 ${
                  viewMode === 'day' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                }`}
              >
                <List size={16} />
                <span className="text-sm font-medium">Día</span>
              </button>
            </div>

            {/* Filtro de estado */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="rejected">Rechazadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas del período */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{periodStats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-xs text-yellow-700">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-900">{periodStats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-700">Confirmadas</p>
            <p className="text-2xl font-bold text-green-900">{periodStats.confirmed}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-red-700">Rechazadas</p>
            <p className="text-2xl font-bold text-red-900">{periodStats.rejected}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-700">Ingresos</p>
            <p className="text-2xl font-bold text-blue-900">{periodStats.revenue.toFixed(0)}€</p>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center text-sm">
          <span className="font-semibold text-gray-700">Leyenda:</span>
          <div className="flex items-center gap-2">
            <Dog size={16} className="text-blue-600" />
            <span className="text-gray-600">Perro</span>
          </div>
          <div className="flex items-center gap-2">
            <Cat size={16} className="text-purple-600" />
            <span className="text-gray-600">Gato</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-yellow-400 rounded"></div>
            <span className="text-gray-600">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-gray-200 rounded"></div>
            <span className="text-gray-600">Disponible</span>
          </div>
          <div className="ml-auto text-gray-600 italic">
            💡 Arrastra las reservas para moverlas entre días
          </div>
        </div>
      </div>

      {/* Calendario */}
      {viewMode === 'day' ? (
        renderDayView()
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Días de la semana */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 border-b border-gray-200">
              {dayNames.map(day => (
                <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-50">
                  {day}
                </div>
              ))}
            </div>
          )}

          {/* Días */}
          <div className={viewMode === 'month' ? 'grid grid-cols-7' : 'flex gap-2 p-2'}>
            {days.map((day, index) => (
              <div key={index}>
                {renderDay(day as Date | null, viewMode === 'week')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      <BookingDetailModal
        booking={selectedBooking!}
        isOpen={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
        onUpdate={fetchBookings}
      />
    </div>
  );
}
