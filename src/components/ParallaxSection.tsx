"use client";

import React, { useEffect, useState } from "react";
import ReviewCard from "./ReviewCard";
import CustomButton from "./CustomButton";

type Review = {
  _id: string;
  author: string;
  date: string;
  text: string;
  sourceUrl: string;
  starRating: number;
};

const ParallaxSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.maisonpourpets.com/reviews")
      .then((res) => res.json())
      .then((data: Review[]) => {
        setReviews(data);
        setLoading(false);
      });
  }, []);

  return (
    <section className="relative overflow-hidden py-8">
      <div
        className="absolute inset-0 bg-fixed bg-center bg-cover z-0"
        style={{
          backgroundImage: "url('/parallax.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
          Retours d'expérience
        </h2>
        <p className="text-base md:text-xl lg:text-2xl max-w-xl mx-auto mb-6">
          Partez l'esprit tranquille et faites-nous confiance: <br />
          votre boule d'amour sera chouchoutée !
        </p>

        {/* Contenido que antes estaba fuera */}
        <div className="w-full max-w-6xl mx-auto mb-6">
          {loading ? (
            <p>Chargement...</p>
          ) : reviews.length === 0 ? (
            <p>Aucun avis trouvé.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}
        </div>
        <div className="flex sm:flex-col md:flex-row gap-4">
          {" "}
          <CustomButton
            label="Contactez-nous"
            alt="Aller à la page de contact"
            variant="primary"
            to="/contact"
          />
          <CustomButton
            label="Laissez un commentaire"
            alt="Aller à la page de Avis"
            variant="primary"
            to="/tarifs"
          />
        </div>
      </div>
    </section>
  );
};
export default ParallaxSection;
