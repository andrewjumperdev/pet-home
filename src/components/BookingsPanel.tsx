import { useEffect, useState, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Definimos el tipo según la respuesta real de Firebase
type Booking = {
  id: string;
  createdAt: string;
  date: string;
  contact: { name: string; email: string };
  details: Array<{ name: string; age: string; breed: string }>;
  sizes: string[];
  quantity: number;
  serviceId: number;
  paymentId: string;
};

export default function BookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    async function fetchBookings() {
      try {
        const snapshot = await getDocs(collection(db, 'bookings'));
        const data = snapshot.docs.map(d => {
        const booking = d.data() as Booking;
        return { ...booking, id: d.id };
        });
        setBookings(data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar las reservas.');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  // Filtrado simple por nombre de contacto o fecha
  const filtered = useMemo(
    () =>
      bookings.filter(b =>
        b.contact.name.toLowerCase().includes(search.toLowerCase()) ||
        b.date.includes(search)
      ),
    [bookings, search]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Reservas</h1>
          <input
            type="text"
            placeholder="Buscar cliente o fecha"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mt-3 sm:mt-0 block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No se encontraron reservas.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Table on md+ */}
              <div className="hidden md:block bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaños</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((b, idx) => (
                      <tr key={b.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(b.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.contact.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.details.map(d => d.name).join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.sizes.join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.paymentId ? '✅' : '❌'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card list on mobile */}
              <div className="md:hidden space-y-4">
                {filtered.map(b => (
                  <div key={b.id} className="bg-white shadow rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Pedido:</span><span>{new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Servicio:</span><span>{b.date}</span>
                    </div>
                    <div className="text-lg font-medium text-gray-900">{b.contact.name}</div>
                    <div className="text-sm text-gray-700">Detalles: {b.details.map(d => d.name).join(', ')}</div>
                    <div className="text-sm text-gray-700">Tamaños: {b.sizes.join(', ')}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Cantidad: {b.quantity}</span>
                      <span className="text-sm">{b.paymentId ? <span className="text-green-600">Pago ✔️</span> : <span className="text-red-600">Pendiente ❌</span>}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
