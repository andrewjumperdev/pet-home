import { useEffect, useState } from "react";
import ReviewCard, { Review } from "./ReviewCard";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ReviewsPage() {
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
          console.warn("API externa respondió con error:", res.status);
        }
      } catch (error) {
        console.error("Error cargando reviews API externa:", error);
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
        console.error("Error cargando reviews de Firestore:", error);
      }

      const combined = [...backendReviews, ...firestoreReviews].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      console.log("Reviews combinados:", combined);

      setReviews(combined);
      setLoading(false);
    }

    loadAllReviews();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (reviews.length === 0) return <p>Aucun avis trouvé.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
      {reviews.map((review, idx) => (
        <ReviewCard
          key={review._id ?? review.date ?? idx}
          review={review}
        />
      ))}
    </div>
  );
}
