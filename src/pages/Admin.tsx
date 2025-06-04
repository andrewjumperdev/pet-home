// src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

import AdminMessages from '../components/AdminMessages';
import BookingsPanel from '../components/BookingsPanel';
import PetsPanel from '../components/PetsPanel';
import ClientsPanel from '../components/ClientsPanel';
import AdminGallery from '../components/AdminGallery';

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<'messages' | 'bookings' | 'pets' | 'clients' | 'gallery'>('messages');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) navigate('/login');
    });
    return () => unsub();
  }, [navigate]);

  const logout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const renderView = () => {
    switch (currentView) {
      case 'messages': return <AdminMessages />;
      case 'bookings': return <BookingsPanel />;
      case 'pets': return <PetsPanel />;
      case 'clients': return <ClientsPanel />;
      case 'gallery': return <AdminGallery />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white fixed top-0 left-0 h-full w-64 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center md:block">
            <h2 className="text-2xl font-bold">Admin</h2>
            <button
              className="text-white md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              ✖
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            <button onClick={() => { setCurrentView('messages'); setSidebarOpen(false); }}>📩 Mensajes</button>
            <button onClick={() => { setCurrentView('bookings'); setSidebarOpen(false); }}>📆 Reservas</button>
            <button onClick={() => { setCurrentView('pets'); setSidebarOpen(false); }}>🐶 Mascotas</button>
            <button onClick={() => { setCurrentView('clients'); setSidebarOpen(false); }}>👤 Clientes</button>
            <button onClick={() => { setCurrentView('gallery'); setSidebarOpen(false); }}>🖼️ Galería</button>
          </nav>
          <button onClick={logout} className="text-red-400 hover:underline mt-10">Cerrar sesión</button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex flex-col p-4 md:p-6 bg-gray-50 min-h-screen ml-0 md:ml-0">
        {/* Topbar on mobile */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 text-2xl">☰</button>
          <h1 className="text-lg font-semibold">Panel de Administración</h1>
        </div>

        {renderView()}
      </main>
    </div>
  );
}
