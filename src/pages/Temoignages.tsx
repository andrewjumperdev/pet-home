"use client";

import { useEffect, useState } from "react";
import ReviewCard from "../components/ReviewCard";


type Review = {
  _id: string;
  author: string;
  date: string;
  text: string;
  sourceUrl: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://pethome-backend.onrender.com/reviews")
      .then((res) => res.json())
      .then((data: Review[]) => {
        setReviews(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4 mt-10">
      <h1 className="text-2xl font-bold mb-4">Avis des clients</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : reviews.length === 0 ? (
        <p>Aucun avis trouvé.</p>
      ) : (
        reviews.map((review) => <ReviewCard key={review._id} review={review} />)
      )}
    </div>
  );
}
