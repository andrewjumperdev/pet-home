"use client";

import { useEffect, useState } from "react";
import ReviewCard, { Review } from "./ReviewCard";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ReviewsDropDown() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllReviews() {
      setLoading(true);

      let backendReviews: Review[] = [];
      try {
        const res = await fetch("https://api.maisonpourpets.com/reviews");
        if (res.ok) {
          backendReviews = await res.json();
        } else {
          console.warn("API externa respondió avec erreur:", res.status);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des avis (API):", error);
      }

      let firestoreReviews: Review[] = [];
      try {
        const snapshot = await getDocs(collection(db, "reviews"));
        firestoreReviews = snapshot.docs.map(doc => {
          const data = doc.data() as any;
          return {
            _id: doc.id,
            author: data.author,
            dogName: data.dogName,
            text: data.text,
            starRating: data.starRating,
            sourceUrl: data.sourceUrl ?? "",
            date:
              data.createdAt && typeof data.createdAt.toDate === "function"
                ? data.createdAt.toDate().toISOString()
                : new Date().toISOString(),
          };
        });
      } catch (error) {
        console.error("Erreur lors du chargement des avis (Firestore):", error);
      }

      const combined = [...backendReviews, ...firestoreReviews].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setReviews(combined);
      setLoading(false);
    }

    loadAllReviews();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (reviews.length === 0) return <p>Aucun avis trouvé.</p>;

  return (
    <div className="mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.slice(0, 3).map((review, idx) => (
          <ReviewCard
            key={review._id ?? review.date ?? idx}
            review={review}
          />
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Link
          to="/avis"
          className="flex items-center text-blue-600 font-medium hover:underline transition"
        >
          Voir plus d'avis
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
