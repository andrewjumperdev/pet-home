// src/components/BookingsPanel.tsx
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type Booking = {
  id: string;
  dateFrom: string;
  dateTo: string;
  type: 'day' | 'night' | 'period';
  status: string;
};

export default function BookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    getDocs(collection(db, 'bookings')).then(snapshot => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setBookings(data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reservas</h1>
      {bookings.length === 0 ? (
        <p>No hay reservas.</p>
      ) : (
        <table className="w-full table-auto bg-white rounded shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Desde</th>
              <th className="p-2">Hasta</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{b.dateFrom}</td>
                <td className="p-2">{b.dateTo}</td>
                <td className="p-2">{b.type}</td>
                <td className="p-2">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
