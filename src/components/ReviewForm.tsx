"use client";

import { useState, FormEvent } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import CustomButton from "./CustomButton";
import { motion } from "framer-motion";

export type Review = {
  _id?: string;
  author: string;
  dogName: string;
  date: string;
  text: string;
  starRating: number;
  sourceUrl?: string;
};

export default function ReviewForm() {
  const [author, setAuthor] = useState("");
  const [dogName, setDogName] = useState("");
  const [email, setEmail] = useState("");
  const [starRating, setStarRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const validate = () =>
    author.trim() && dogName.trim() && email.trim() && starRating >= 1 && text.trim();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setError("Veuillez remplir tous les champs et donner une note entre 1 et 5.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const colRef = collection(db, "reviews");
      const newReview = {
        author,
        dogName,
        email,
        text,
        starRating,
        sourceUrl: "",
        createdAt: serverTimestamp(),
      };
      await addDoc(colRef, newReview);
      setSuccess(true);
      setAuthor(""); setDogName(""); setEmail(""); setStarRating(0); setText("");
    } catch {
      setError("Une erreur est survenue lors de l'envoi, veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-xl space-y-6"
      animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-2xl md:text-3xl font-bold text-gray-800 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Laissez un avis ✍️
      </motion.h2>

      {error && <p className="text-red-600 text-center">{error}</p>}
      {success && <p className="text-green-600 text-center">Merci pour votre avis !</p>}

      {/* Nom complet */}
      <motion.div
        animate={error && !author.trim() ? { x: [0, -5, 5, -5, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <label className="block mb-1 text-sm font-semibold text-gray-700 text-start">Prénom</label>
        <input
          type="text"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            error && !author.trim() ? 'border-red-500' : 'border-gray-300'
          } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          placeholder="Votre nom"
        />
      </motion.div>

      {/* Nom du chien */}
      <motion.div
        animate={error && !dogName.trim() ? { x: [0, -5, 5, -5, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <label className="block mb-1 text-sm font-semibold text-gray-700 text-start">Nom du chien</label>
        <input
          type="text"
          value={dogName}
          onChange={e => setDogName(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            error && !dogName.trim() ? 'border-red-500' : 'border-gray-300'
          } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          placeholder="Ex: Max, Bella..."
        />
      </motion.div>

      {/* Email */}
      <motion.div
        animate={error && !email.trim() ? { x: [0, -5, 5, -5, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <label className="block mb-1 text-sm font-semibold text-gray-700 text-start">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            error && !email.trim() ? 'border-red-500' : 'border-gray-300'
          } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          placeholder="exemple@email.com"
        />
      </motion.div>

      {/* Note en étoiles */}
      <div>
        <label className="block mb-1 text-sm font-semibold text-gray-700 text-start">Note</label>
        <div className="flex items-center space-x-2 mt-1">
          {Array.from({ length: 5 }, (_, i) => i + 1).map(star => (
            <motion.button
              whileHover={{ scale: 1.2 }}
              key={star}
              type="button"
              onClick={() => setStarRating(star)}
              className={`text-3xl transition-colors duration-200 ${
                star <= starRating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              aria-label={`${star} étoiles`}
            >
              ★
            </motion.button>
          ))}
        </div>
      </div>

      {/* Commentaire */}
      <motion.div
        animate={error && !text.trim() ? { x: [0, -5, 5, -5, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <label className="block mb-1 text-sm font-semibold text-gray-700 text-start">Commentaire</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          className={`w-full px-4 py-2 rounded-lg border ${
            error && !text.trim() ? 'border-red-500' : 'border-gray-300'
          } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          placeholder="Votre retour d'expérience..."
        />
      </motion.div>

      {/* Bouton */}
      <div className="text-center pt-4">
        <CustomButton
          label={submitting ? 'Envoi en cours...' : 'Envoyer mon avis'}
          alt="Envoyer un avis"
          type="submit"
          variant="primary"
        />
      </div>
    </motion.form>
  );
}
