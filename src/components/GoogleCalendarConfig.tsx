import { useState, useEffect } from 'react';
import {
  initGoogleCalendar,
  signInToGoogle,
  signOutFromGoogle,
  isGoogleSignedIn,
  syncAllBookingsToCalendar
} from '../services/googleCalendar';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Booking } from '../types';
import {
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogIn,
  LogOut,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function GoogleCalendarConfig() {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [lastSyncResult, setLastSyncResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkGoogleCalendarStatus();
  }, []);

  async function checkGoogleCalendarStatus() {
    try {
      // Cargar el script de Google API si no está cargado
      if (typeof window !== 'undefined' && !(window as any).gapi) {
        await loadGoogleApiScript();
      }

      const initialized = await initGoogleCalendar();
      setIsInitialized(initialized);

      if (initialized) {
        setIsConnected(isGoogleSignedIn());
      }
    } catch (err) {
      console.error('Error checking Google Calendar status:', err);
      setError('Error al verificar el estado de Google Calendar');
    }
  }

  function loadGoogleApiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        (window as any).gapi.load('client:auth2', () => {
          resolve();
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async function handleSignIn() {
    try {
      setError(null);
      const success = await signInToGoogle();
      setIsConnected(success);
      if (!success) {
        setError('No se pudo iniciar sesión en Google Calendar');
      }
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Error al iniciar sesión');
    }
  }

  async function handleSignOut() {
    try {
      setError(null);
      const success = await signOutFromGoogle();
      setIsConnected(!success);
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Error al cerrar sesión');
    }
  }

  async function handleSyncAll() {
    try {
      setError(null);
      setSyncing(true);
      setSyncProgress({ current: 0, total: 0 });

      // Obtener todas las reservas confirmadas
      const snapshot = await getDocs(collection(db, 'bookings'));
      const bookings = snapshot.docs
        .map(d => ({ ...(d.data() as Booking), id: d.id }))
        .filter(b => b.status === 'confirmed'); // Solo sincronizar confirmadas

      setSyncProgress({ current: 0, total: bookings.length });

      const result = await syncAllBookingsToCalendar(
        bookings,
        (current, total) => {
          setSyncProgress({ current, total });
        }
      );

      setLastSyncResult(result);
    } catch (err) {
      console.error('Error syncing:', err);
      setError('Error al sincronizar con Google Calendar');
    } finally {
      setSyncing(false);
    }
  }

  if (!isInitialized) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 w-6 h-6 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">
              Configuración requerida
            </h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>Para usar la integración con Google Calendar, necesitas:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Crear un proyecto en Google Cloud Console</li>
                <li>Habilitar la API de Google Calendar</li>
                <li>Crear credenciales OAuth 2.0</li>
                <li>Agregar las variables de entorno:
                  <code className="block bg-yellow-100 px-2 py-1 rounded mt-1 text-xs">
                    VITE_GOOGLE_API_KEY=tu_api_key<br />
                    VITE_GOOGLE_CLIENT_ID=tu_client_id
                  </code>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado de conexión */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Calendar className={isConnected ? 'text-green-600' : 'text-gray-400'} size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Google Calendar
              </h3>
              <p className="text-sm text-gray-600">
                {isConnected ? 'Conectado y sincronizado' : 'No conectado'}
              </p>
            </div>
          </div>

          {isConnected ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              <LogOut size={18} />
              Desconectar
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <LogIn size={18} />
              Conectar con Google
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2">
            <XCircle className="text-red-600" size={20} />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Sincronización */}
      {isConnected && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sincronización
          </h3>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-blue-600 w-5 h-5 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Solo se sincronizan las reservas <strong>confirmadas</strong></li>
                    <li>Los eventos se crean con colores según su estado</li>
                    <li>La sincronización es manual (haz clic en el botón)</li>
                    <li>Los cambios en Google Calendar NO se reflejan automáticamente aquí</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Sincronizando... ({syncProgress.current}/{syncProgress.total})
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Sincronizar todas las reservas confirmadas
                </>
              )}
            </button>

            {/* Progreso de sincronización */}
            {isSyncing && syncProgress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progreso</span>
                  <span>{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-green-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Resultado de la última sincronización */}
            {lastSyncResult && !isSyncing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <h4 className="font-semibold text-gray-900 mb-2">Última sincronización:</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle size={18} />
                    <span className="font-semibold">{lastSyncResult.success} exitosas</span>
                  </div>
                  {lastSyncResult.failed > 0 && (
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle size={18} />
                      <span className="font-semibold">{lastSyncResult.failed} fallidas</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Instrucciones de uso */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="text-blue-600" size={20} />
          Cómo usar la integración
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <p>Conecta tu cuenta de Google Calendar haciendo clic en "Conectar con Google"</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <p>Haz clic en "Sincronizar" para enviar todas las reservas confirmadas a tu calendario</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <p>Cada reserva aparecerá en Google Calendar con todos los detalles y un color según su estado</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
            <p>Cuando confirmes/rechaces una reserva aquí, vuelve a sincronizar para actualizar Google Calendar</p>
          </div>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Colores en Google Calendar
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-sm text-gray-700">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">Rechazada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-700">Cancelada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
