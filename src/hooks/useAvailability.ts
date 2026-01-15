import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface AvailabilityResult {
  isAvailable: boolean;
  available: number;
  total: number;
  booked: number;
  loading: boolean;
}

const MAX_CAPACITY_PER_DAY = 5;

export function useAvailability(date: string, requestedQuantity: number = 1): AvailabilityResult {
  const [result, setResult] = useState<AvailabilityResult>({
    isAvailable: true,
    available: MAX_CAPACITY_PER_DAY,
    total: MAX_CAPACITY_PER_DAY,
    booked: 0,
    loading: true,
  });

  useEffect(() => {
    async function checkAvailability() {
      if (!date) {
        setResult(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Obtener todas las reservas confirmadas para esa fecha
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('date', '==', date),
          where('status', '==', 'confirmed')
        );

        const snapshot = await getDocs(bookingsQuery);

        // Sumar la cantidad total de mascotas reservadas
        const totalBooked = snapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data.quantity || 1);
        }, 0);

        const available = MAX_CAPACITY_PER_DAY - totalBooked;
        const isAvailable = available >= requestedQuantity;

        setResult({
          isAvailable,
          available,
          total: MAX_CAPACITY_PER_DAY,
          booked: totalBooked,
          loading: false,
        });
      } catch (error) {
        console.error('Error checking availability:', error);
        setResult(prev => ({ ...prev, loading: false }));
      }
    }

    checkAvailability();
  }, [date, requestedQuantity]);

  return result;
}

// Hook para verificar disponibilidad de un rango de fechas
export function useRangeAvailability(startDate: Date | null, endDate: Date | null, quantity: number = 1) {
  const [result, setResult] = useState<{
    isAvailable: boolean;
    unavailableDates: string[];
    loading: boolean;
  }>({
    isAvailable: true,
    unavailableDates: [],
    loading: true,
  });

  useEffect(() => {
    async function checkRangeAvailability() {
      if (!startDate || !endDate) {
        setResult({ isAvailable: true, unavailableDates: [], loading: false });
        return;
      }

      try {
        const unavailableDates: string[] = [];
        let currentDate = new Date(startDate);
        const finalDate = new Date(endDate);

        while (currentDate <= finalDate) {
          const dateStr = currentDate.toISOString().split('T')[0];

          const bookingsQuery = query(
            collection(db, 'bookings'),
            where('date', '==', dateStr),
            where('status', '==', 'confirmed')
          );

          const snapshot = await getDocs(bookingsQuery);
          const totalBooked = snapshot.docs.reduce((sum, doc) => {
            const data = doc.data();
            return sum + (data.quantity || 1);
          }, 0);

          const available = MAX_CAPACITY_PER_DAY - totalBooked;
          if (available < quantity) {
            unavailableDates.push(dateStr);
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        setResult({
          isAvailable: unavailableDates.length === 0,
          unavailableDates,
          loading: false,
        });
      } catch (error) {
        console.error('Error checking range availability:', error);
        setResult({ isAvailable: true, unavailableDates: [], loading: false });
      }
    }

    checkRangeAvailability();
  }, [startDate, endDate, quantity]);

  return result;
}
