import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, CalendarDays, User, Info } from "lucide-react";

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    return (
      <div className="text-center mt-20 text-red-500 font-semibold">
        Aucune information de réservation. 😓
      </div>
    );
  }

  const { order, contact, serviceId, dates, bookingCount } = data;

  return (
    <motion.div
      className="bg-green-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="text-green-600 w-8 h-8" />
          <h1 className="text-2xl font-bold text-green-700">
            Paiement réussi !
          </h1>
        </div>

        <div className="space-y-4 text-gray-700">
          <div className="flex items-center space-x-2">
            <User className="text-blue-500" />
            <span>
              <strong>Nom:</strong> {contact.name}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Info className="text-blue-500" />
            <span>
              <strong>Référence de paiement:</strong> {order.id}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <CalendarDays className="text-blue-500" />
            <span>
              <strong>Dates:</strong>{" "}
              {new Date(dates[0]).toLocaleDateString("fr-FR")} →{" "}
              {new Date(dates[1]).toLocaleDateString("fr-FR")} ({bookingCount}{" "}
              jours)
            </span>
          </div>

          <div>
            <strong>Service réservé:</strong>{" "}
            <span className="text-blue-600">
              {serviceId === 1
                ? "FORMULE FLASH"
                : serviceId === 2
                ? "FORMULE SÉJOURS"
                : serviceId === 3
                ? "FORMULE FÉLIN"
                : "Inconnu"}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
        >
          Retour à l’accueil
        </button>
      </div>
    </motion.div>
  );
}
