"use client";

import { useEffect, useState } from "react";
import ReviewCard from "./ReviewCard";


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
    <div className="mt-10">
      {loading ? (
        <p>Chargement...</p>
      ) : reviews.length === 0 ? (
        <p>Aucun avis trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => <ReviewCard key={review._id} review={review} />)}
        </div>        
      )}
    </div>
  );
}
