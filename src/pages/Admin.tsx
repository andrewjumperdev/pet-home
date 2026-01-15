import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminMessages from "../components/AdminMessages";
import BookingsPanel from "../components/BookingsPanel";
import CalendarDashboard from "../components/CalendarDashboard";
import GoogleCalendarConfig from "../components/GoogleCalendarConfig";
import PetsPanel from "../components/PetsPanel";
import ClientsPanel from "../components/ClientsPanel";
import AdminGallery from "../components/AdminGallery";
import { auth } from "../lib/firebase";
import {
  MessageSquare,
  Calendar,
  CalendarDays,
  Dog,
  Users,
  Image,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState("calendar");
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

  const menuItems = [
    { id: "calendar", label: "Calendario", icon: CalendarDays },
    { id: "bookings", label: "Reservas", icon: Calendar },
    { id: "messages", label: "Mensajes", icon: MessageSquare },
    { id: "pets", label: "Mascotas", icon: Dog },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "gallery", label: "Galería", icon: Image },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case "calendar":
        return <CalendarDashboard />;
      case "bookings":
        return <BookingsPanel />;
      case "messages":
        return <AdminMessages />;
      case "pets":
        return <PetsPanel />;
      case "clients":
        return <ClientsPanel />;
      case "gallery":
        return <AdminGallery />;
      case "settings":
        return <GoogleCalendarConfig />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen md:flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-blue-900 to-blue-800 text-white fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out shadow-2xl
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${sidebarCollapsed ? "w-20" : "w-72"}
          md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-blue-700">
            <div className="flex justify-between items-center">
              <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Panel Admin
                </h2>
                <p className="text-blue-200 text-sm mt-1">Maison pour Pets</p>
              </div>
              <button
                className="text-white md:hidden hover:bg-blue-700 p-2 rounded-lg transition"
                onClick={() => setSidebarOpen(false)}
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive
                      ? "bg-white text-blue-900 shadow-lg"
                      : "text-blue-100 hover:bg-blue-700/50"
                    }
                    ${sidebarCollapsed ? "justify-center" : ""}`}
                >
                  <Icon
                    size={20}
                    className={`${isActive ? "text-blue-600" : "text-blue-200 group-hover:text-white"}`}
                  />
                  <span className={`font-medium ${sidebarCollapsed ? "hidden" : "block"}`}>
                    {item.label}
                  </span>
                  {isActive && !sidebarCollapsed && (
                    <span className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer - Logout */}
          <div className="p-4 border-t border-blue-700">
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/20 transition-all duration-200 group
                ${sidebarCollapsed ? "justify-center" : ""}`}
            >
              <LogOut size={20} className="group-hover:text-red-200" />
              <span className={`font-medium ${sidebarCollapsed ? "hidden" : "block"}`}>
                Cerrar sesión
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300
        ${sidebarCollapsed ? "md:ml-20" : "md:ml-72"}`}>

        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition"
              >
                <Menu size={24} />
              </button>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex items-center justify-center text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition"
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {menuItems.find(item => item.id === currentView)?.label || "Panel de Administración"}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Gestiona tu negocio desde aquí
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">En línea</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
