import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export default function ClientsPanel() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    getDocs(collection(db, 'clients')).then(snapshot => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setClients(data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      {clients.length === 0 ? (
        <p>No hay clientes.</p>
      ) : (
        <table className="w-full table-auto bg-white rounded shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Teléfono</th>
              <th className="p-2">Correo</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.phone}</td>
                <td className="p-2">{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}