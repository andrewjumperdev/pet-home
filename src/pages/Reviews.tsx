// app/avis/page.tsx
"use client";

import { useEffect, useState } from "react";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";
import CustomButton from "../components/CustomButton";


type Review = {
  _id: string;
  author: string;
  date: string;
  text: string;
  sourceUrl: string;
  starRating: number;
};

export default function AvisPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("https://api.maisonpourpets.com/reviews");
        const data = await res.json();
        setReviews(data);
      } catch (error) {
        console.error("Erreur lors du chargement des avis :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  return (
    <main className="min-h-screen px-4 py-12 bg-gray-50 mt-20">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Ils nous ont fait confiance
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          Découvrez ce que nos clients disent de leur expérience chez nous.
        </p>

        {loading ? (
          <p className="text-gray-500">Chargement des avis...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500">Aucun avis trouvé.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}

          <div className="mt-12" id="avis">
            <ReviewForm />
          </div>
        <div className="mt-12">
        <CustomButton
          label={'Retour à l\'accueil'}
          alt="Retour à l'accueil"
          type="button"
          variant="primary"
          to="/"
        />
        </div>
      </div>
    </main>
  );
}
