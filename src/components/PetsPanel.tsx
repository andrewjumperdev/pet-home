import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type Pet = {
  id: string;
  name: string;
  type: 'dog' | 'cat';
  breed: string;
  ownerId: string;
};

export default function PetsPanel() {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    getDocs(collection(db, 'pets')).then(snapshot => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setPets(data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mascotas</h1>
      {pets.length === 0 ? (
        <p>No hay mascotas registradas.</p>
      ) : (
        <table className="w-full table-auto bg-white rounded shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Raza</th>
            </tr>
          </thead>
          <tbody>
            {pets.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.type}</td>
                <td className="p-2">{p.breed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}