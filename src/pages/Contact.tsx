// src/pages/ContactPage.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mail, Clock, Send, MessageCircle, CheckCircle, AlertCircle } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  petType: "dog" | "cat" | "";
  companionName: string;
  companionBreed: string;
  companionAge: string;
  service: string;
  message: string;
  newsletter: boolean;
}

const services = [
  { value: "flash", label: "Formule Flash", desc: "Garde courte durée" },
  { value: "sejour", label: "Formule Séjour", desc: "Garde longue durée" },
  { value: "felin", label: "Formule Félin", desc: "Spécial chats" },
];

const contactInfo = [
  {
    icon: MapPin,
    title: "Adresse",
    content: "Antony, Île-de-France",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Mail,
    title: "Email",
    content: "maisonpourpets@hotmail.com",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Clock,
    title: "Disponibilité",
    content: "7j/7 - Réponse sous 24h",
    color: "bg-purple-100 text-purple-600",
  },
];

const ContactPage: React.FC = () => {
  const [values, setValues] = React.useState<ContactFormValues>({
    name: "",
    email: "",
    phone: "",
    petType: "",
    companionName: "",
    companionBreed: "",
    companionAge: "",
    service: "flash",
    message: "",
    newsletter: false,
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleChange =
    (field: keyof ContactFormValues) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value =
        e.currentTarget.type === "checkbox"
          ? (e.currentTarget as HTMLInputElement).checked
          : e.currentTarget.value;
      setValues((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addDoc(collection(db, "contacts"), {
        ...values,
        timestamp: new Date(),
      });
      setSuccess(true);
      setValues({
        name: "",
        email: "",
        phone: "",
        petType: "",
        companionName: "",
        companionBreed: "",
        companionAge: "",
        service: "flash",
        message: "",
        newsletter: false,
      });
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Helmet>
        <title>Contact - PetHome</title>
        <meta
          name="description"
          content="Contactez PetHome pour réserver une garde pour votre animal. Réponse rapide garantie !"
        />
        <meta property="og:title" content="Contact - PetHome" />
        <meta
          property="og:description"
          content="Contactez PetHome pour réserver une garde pour votre animal. Réponse rapide garantie !"
        />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-100 rounded-full opacity-50 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <MessageCircle className="w-4 h-4" />
              Réponse sous 24h garantie
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Parlons de votre{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
                compagnon
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              Une question ? Consultez d'abord notre{' '}
              <Link to="/faq" className="text-blue-500 font-semibold hover:underline">
                FAQ
              </Link>
              . Sinon, remplissez le formulaire et nous vous répondrons rapidement !
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Info Cards */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Nos coordonnées
              </h2>

              <div className="space-y-6">
                {contactInfo.map((info, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${info.color}`}>
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{info.title}</p>
                      <p className="text-gray-900 font-semibold">{info.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trust Box */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Pourquoi nous contacter ?</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Visite découverte gratuite",
                  "Devis personnalisé sans engagement",
                  "Conseils adaptés à votre animal",
                  "Réservation simple et rapide",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-blue-100">
                    <svg className="w-5 h-5 text-blue-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact Form - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Envoyez-nous un message
              </h2>
              <p className="text-gray-500 mb-8">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Votre nom *
                    </label>
                    <input
                      type="text"
                      placeholder="Jean Dupont"
                      value={values.name}
                      onChange={handleChange("name")}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="jean@exemple.com"
                      value={values.email}
                      onChange={handleChange("email")}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={values.phone}
                      onChange={handleChange("phone")}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Pet Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Type d'animal *
                  </label>
                  <div className="flex gap-4">
                    {[
                      { value: "dog", label: "Chien", emoji: "🐕" },
                      { value: "cat", label: "Chat", emoji: "🐱" },
                    ].map((pet) => (
                      <button
                        key={pet.value}
                        type="button"
                        onClick={() => setValues((prev) => ({ ...prev, petType: pet.value as "dog" | "cat" }))}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                          values.petType === pet.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-2xl">{pet.emoji}</span>
                        <span className="font-semibold">{pet.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Details - Conditional */}
                <AnimatePresence>
                  {values.petType && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nom de votre {values.petType === "dog" ? "chien" : "chat"} *
                          </label>
                          <input
                            type="text"
                            placeholder="Max"
                            value={values.companionName}
                            onChange={handleChange("companionName")}
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                          />
                        </div>
                        {values.petType === "dog" && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Race *
                            </label>
                            <input
                              type="text"
                              placeholder="Labrador"
                              value={values.companionBreed}
                              onChange={handleChange("companionBreed")}
                              required
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Âge (années) *
                          </label>
                          <input
                            type="number"
                            placeholder="3"
                            min="0"
                            max="30"
                            value={values.companionAge}
                            onChange={handleChange("companionAge")}
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Service souhaité *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {services.map((service) => (
                      <button
                        key={service.value}
                        type="button"
                        onClick={() => setValues((prev) => ({ ...prev, service: service.value }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          values.service === service.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className={`font-semibold ${values.service === service.value ? "text-blue-700" : "text-gray-900"}`}>
                          {service.label}
                        </p>
                        <p className="text-sm text-gray-500">{service.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Votre message *
                  </label>
                  <textarea
                    placeholder="Décrivez vos besoins, les dates souhaitées, ou posez vos questions..."
                    value={values.message}
                    onChange={handleChange("message")}
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Error/Success Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <p>Message envoyé avec succès ! Nous vous répondrons rapidement.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                    loading
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
