"use client";

import React, { useEffect, useState } from "react";
import ReviewCard from "./ReviewCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/modules";
import "swiper/swiper-bundle.css";

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
    <section className="relative overflow-hidden py-16">
      {/* Fondo parallax */}
      <div
        className="absolute inset-0 bg-fixed bg-center bg-cover z-0"
        style={{ backgroundImage: "url('/parallax.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/60 z-10" />

      <div className="relative z-20 text-white px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Aventures, câlins et repos
        </h1>
        <p className="text-lg md:text-2xl font-light mb-8">
          <span className="font-semibold">
            Partez l'esprit tranquille et faites-nous confiance: votre boule
            d'amour sera chouchoutée !
          </span>
        </p>

        <div className="w-full max-w-6xl mx-auto">
          {loading ? (
            <p>Chargement...</p>
          ) : reviews.length === 0 ? (
            <p>Aucun avis trouvé.</p>
          ) : (
            <Swiper
              modules={[Pagination, Autoplay, Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000 }}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="pb-10"
            >
              {reviews.slice(0, 6).map((review) => (
                <SwiperSlide key={review._id} className="flex h-full">
                  <div className="w-full h-full">
                    <ReviewCard review={review} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
};

export default ParallaxSection;
