import React, { useEffect, useState } from 'react';
import {
  getDocs,
  deleteDoc,
  collection,
  doc
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import AdminGallery from '../components/AdminGallery';

type ContactMessage = {
  id: string;
  name: string;
  message: string;
  email?: string;
  newsletter?: boolean;
  timestamp: { seconds: number };
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, user => {
      if (user) {
        nav('/login');
      }
    });

    getDocs(collection(db, 'contacts'))
      .then(snapshot => {
        const data = snapshot.docs.map(d => ({
          id: d.id,
          ...(d.data() as any)
        }));
        setMessages(data);
      })
      .finally(() => setLoading(false));

    return () => unsubAuth();
  }, [nav]);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'contacts', id));
    setMessages(s => s.filter(x => x.id !== id));
  };

  const logout = async () => {
    await signOut(auth);
    nav('/login');
  };

  if (loading) return <p className="p-8">Cargando…</p>;

  return (
    <div className="p-8 space-y-6 m-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mensajes de Contacto</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      {messages.length === 0 ? (
        <p className="text-gray-600">No hay mensajes.</p>
      ) : (
        <table className="w-full table-auto bg-white rounded shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Fecha</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Mensaje</th>
              <th className="p-2">Newsletter</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(msg => (
              <tr key={msg.id} className="border-t hover:bg-gray-50">
                <td className="p-2">
                  {new Date(msg.timestamp?.seconds * 1000).toLocaleString()}
                </td>
                <td className="p-2">{msg.name}</td>
                <td className="p-2">{msg.message}</td>
                <td className="p-2">
                  {msg.newsletter ? '✅' : '❌'}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AdminGallery />
    </div>
  );
}
