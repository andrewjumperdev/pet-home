import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminMessages from "../components/AdminMessages";
import BookingsPanel from "../components/BookingsPanel";
import PetsPanel from "../components/PetsPanel";
import ClientsPanel from "../components/ClientsPanel";
import AdminGallery from "../components/AdminGallery";
import { auth } from "../lib/firebase";

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState("messages");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const sessionFlag = sessionStorage.getItem("isAdminLogged") === "true";
      const firebaseUser = auth.currentUser;
      
      if (!sessionFlag || !firebaseUser) {
        navigate("/login");
      }
    };

    checkAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        sessionStorage.removeItem('isAdminLogged');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const logout = async () => {
    try {
      await auth.signOut();
      sessionStorage.removeItem('isAdminLogged');
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "messages":
        return <AdminMessages />;
      case "bookings":
        return <BookingsPanel />;
      case "pets":
        return <PetsPanel />;
      case "clients":
        return <ClientsPanel />;
      case "gallery":
        return <AdminGallery />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          ${sidebarCollapsed ? "w-16" : "w-64"} 
          md:translate-x-0`} 
      >
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${sidebarCollapsed ? "hidden" : "block"}`}>Admin</h2>
            <button
              className="text-white md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              ✖
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => {
                setCurrentView("messages");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2"
            >
              <span>📩</span>
              <span className={sidebarCollapsed ? "hidden" : "block"}>Mensajes</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("bookings");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2"
            >
              <span>📆</span>
              <span className={sidebarCollapsed ? "hidden" : "block"}>Reservas</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("pets");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2"
            >
              <span>🐶</span>
              <span className={sidebarCollapsed ? "hidden" : "block"}>Mascotas</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("clients");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2"
            >
              <span>👤</span>
              <span className={sidebarCollapsed ? "hidden" : "block"}>Clientes</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("gallery");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2"
            >
              <span>🖼️</span>
              <span className={sidebarCollapsed ? "hidden" : "block"}>Galería</span>
            </button>
          </nav>
          <button
            onClick={logout}
            className={`text-red-400 hover:underline mt-10 flex items-center gap-2 ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <span>🚪</span>
            <span className={sidebarCollapsed ? "hidden" : "block"}>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className={`flex flex-col p-4 md:p-6 bg-gray-50 min-h-screen transition-all duration-300
        ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 text-2xl md:hidden"
          >
            ☰
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:block text-gray-700"
          >
            {sidebarCollapsed ? <span className="mr-4"><i className="fa-solid fa-angle-right"></i></span> : <span className="mr-4"><i className="fa-solid fa-angle-left"></i></span>}
          </button>
          <h1 className="text-lg font-semibold">Panel de Administración</h1>
        </div>

        {renderView()}
      </main>
    </div>
  );
}