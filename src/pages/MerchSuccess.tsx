/**
 * Página de confirmación de compra exitosa
 */

import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Package,
  Mail,
  Truck,
  Home,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MerchSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, email } = (location.state as { orderId?: string; email?: string }) || {};

  useEffect(() => {
    // Lanzar confetti al montar
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#14b8a6', '#0ea5e9', '#8b5cf6'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#14b8a6', '#0ea5e9', '#8b5cf6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Redirigir si no hay datos de orden
    if (!orderId) {
      const timer = setTimeout(() => {
        navigate('/merch');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center"
        >
          {/* Icono de éxito */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-14 h-14 text-green-500" />
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            ¡Gracias por tu compra!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-slate-600 mb-8"
          >
            Tu pedido ha sido confirmado y está siendo procesado.
          </motion.p>

          {/* Detalles del pedido */}
          {orderId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-50 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Package className="w-5 h-5 text-teal-600" />
                <span className="font-semibold text-slate-900">
                  Número de pedido
                </span>
              </div>
              <p className="font-mono text-lg text-slate-700 bg-white px-4 py-2 rounded-lg inline-block">
                {orderId.slice(0, 20)}...
              </p>
            </motion.div>
          )}

          {/* Timeline del pedido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 mb-8"
          >
            <h3 className="font-semibold text-slate-900 mb-4">
              ¿Qué sigue ahora?
            </h3>

            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Confirmación por email
                </p>
                <p className="text-sm text-slate-500">
                  {email
                    ? `Recibirás un email de confirmación en ${email}`
                    : 'Recibirás un email de confirmación con los detalles'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Producción del pedido
                </p>
                <p className="text-sm text-slate-500">
                  Tu pedido será fabricado en 2-5 días laborables
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Envío</p>
                <p className="text-sm text-slate-500">
                  Recibirás un email con el número de seguimiento cuando se envíe
                </p>
              </div>
            </div>
          </motion.div>

          {/* Botones de acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/"
              className="flex-1 py-4 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Volver al inicio
            </Link>
            <Link
              to="/merch"
              className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Seguir comprando
            </Link>
          </motion.div>
        </motion.div>

        {/* Mensaje adicional */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-slate-500 mt-8"
        >
          ¿Tienes alguna pregunta?{' '}
          <Link to="/contacto" className="text-teal-600 font-semibold hover:underline">
            Contáctanos
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
