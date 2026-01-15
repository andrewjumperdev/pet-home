import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, CalendarDays, User, Clock, Mail, AlertCircle } from "lucide-react";

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    return (
      <div className="text-center mt-20 text-red-500 font-semibold">
        Aucune information de réservation.
      </div>
    );
  }

  const { contact, serviceId, dates, bookingCount } = data;

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Success Card */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="bg-white p-8 rounded-2xl shadow-2xl space-y-6 border border-green-200"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
            >
              <CheckCircle className="text-green-600 w-12 h-12" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Réservation enregistrée !
            </h1>
            <p className="text-gray-600">
              Votre demande de réservation a été enregistrée avec succès
            </p>
          </div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <Clock className="text-yellow-600 w-6 h-6 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Paiement en attente de confirmation
                </h3>
                <p className="text-sm text-yellow-800">
                  Votre carte a été enregistrée avec succès mais <strong>ne sera pas débitée</strong> avant
                  que nous confirmions votre réservation. Nous vérifierons la disponibilité et vous
                  enverrons un email de confirmation sous 24h. Le montant sera alors prélevé automatiquement.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Reservation Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Détails de votre réservation
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="text-blue-500 w-5 h-5" />
                <div>
                  <p className="text-xs text-gray-500">Nom du client</p>
                  <p className="font-semibold text-gray-900">{contact.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="text-blue-500 w-5 h-5" />
                <div>
                  <p className="text-xs text-gray-500">Email de contact</p>
                  <p className="font-semibold text-gray-900">{contact.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarDays className="text-blue-500 w-5 h-5" />
                <div>
                  <p className="text-xs text-gray-500">Dates de séjour</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(dates[0]).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(dates[1]).toLocaleDateString("fr-FR")}
                    <span className="text-sm text-gray-600 ml-2">
                      ({bookingCount} {bookingCount > 1 ? 'jours' : 'jour'})
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Service réservé</p>
                  <p className="font-semibold text-blue-700">
                    {serviceId === 1 || serviceId === "1"
                      ? "FORMULE FLASH"
                      : serviceId === 2 || serviceId === "2"
                      ? "FORMULE SÉJOURS"
                      : serviceId === "felin"
                      ? "FORMULE FÉLIN"
                      : "Service personnalisé"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-blue-50 border border-blue-200 p-4 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 w-6 h-6 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Prochaines étapes
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Vous recevrez un email de confirmation de votre demande</li>
                  <li>Nous vérifierons la disponibilité pour vos dates</li>
                  <li>Une fois confirmée, votre carte sera automatiquement débitée</li>
                  <li>Vous recevrez un email de confirmation finale ou de modification sous 24h</li>
                  <li>En cas de rejet, aucun montant ne sera prélevé</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
            >
              Retour à l'accueil
            </button>
            <button
              onClick={() => navigate("/services")}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition"
            >
              Voir nos services
            </button>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          <p>
            Des questions ? Contactez-nous à{" "}
            <a href="mailto:contact@maisonpourpets.com" className="text-blue-600 hover:underline font-medium">
              contact@maisonpourpets.com
            </a>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
