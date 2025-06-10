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

  const validate = () => {
    return author.trim() && dogName.trim() && email.trim() && starRating >= 1 && text.trim();
  };

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
      className="max-w-lg p-6 bg-white rounded-2xl space-y-4"
      animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-semibold text-gray-800">Laisser un avis</h3>
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Merci pour votre avis !</p>}

      {/** Champ Nom complet **/}
      <motion.div
        animate={error && !author.trim() ? { x: [0, -5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <label className="block text-sm font-medium text-gray-700">Nom complet</label>
        <input
          type="text"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          required
          className={`mt-1 w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error && !author.trim() ? 'border-red-500' : ''}`}
        />
      </motion.div>

      {/** Champ Nom du chien **/}
      <motion.div
        animate={error && !dogName.trim() ? { x: [0, -5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <label className="block text-sm font-medium text-gray-700">Nom du chien</label>
        <input
          type="text"
          value={dogName}
          onChange={e => setDogName(e.target.value)}
          required
          className={`mt-1 w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error && !dogName.trim() ? 'border-red-500' : ''}`}
        />
      </motion.div>

      {/** Champ Email **/}
      <motion.div
        animate={error && !email.trim() ? { x: [0, -5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={`mt-1 w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error && !email.trim() ? 'border-red-500' : ''}`}
        />
      </motion.div>

      {/** Champ Note **/}
      <div>
        <label className="block text-sm font-medium text-gray-700">Note</label>
        <div className="flex space-x-1 mt-1">
          {Array.from({ length: 5 }, (_, i) => i + 1).map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setStarRating(star)}
              className={`text-2xl ${star <= starRating ? 'text-yellow-400' : 'text-gray-300'}`}
              aria-label={`${star} étoiles`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/** Champ Commentaire **/}
      <motion.div
        animate={error && !text.trim() ? { x: [0, -5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <label className="block text-sm font-medium text-gray-700">Commentaire</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          required
          rows={4}
          className={`mt-1 w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error && !text.trim() ? 'border-red-500' : ''}`}
        />
      </motion.div>

      <CustomButton
        label={submitting ? 'Envoi...' : 'Envoyer mon avis'}
        alt="Envoyer mon avis"
        variant="primary"
        type="submit"
      />
    </motion.form>
  );
}
