import React from "react";
import PawPrintsTrail from "./PawPrintsTrail";

const Hero: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-yellow-50">
      <section className="hero relative h-full flex items-center justify-center overflow-hidden z-20">
        {/* Paw prints animation overlay */}
        <div className="absolute inset-0 pointer-events-none z-30">
          <PawPrintsTrail />
        </div>

        {/* Background images */}
        <div
          className="absolute inset-0 bg-[url('/hero-small.webp')] bg-cover bg-center z-0 md:hidden"
        ></div>
        <div
          className="absolute inset-0 bg-[url('/hero-img.jpg')] bg-cover bg-center z-0 hidden md:block"
        ></div>

        {/* Darker gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent z-10"></div>

        {/* Hero text */}
        <div className="hero-text relative text-center z-20 text-white px-4">
          <h1
            className="text-4xl md:text-6xl font-extrabold mb-4 animate-[wiggle_1s_ease-in-out_infinite] drop-shadow-lg"
          >
            PetHome
          </h1>
          <p className="text-lg md:text-2xl mb-6 max-w-md mx-auto drop-shadow-md">
            Service de garderie <span className="text-red-400 font-extrabold">privé</span> pour chiens et chats<br />
            Aventures, fun et câlins : les vacances rêvées pour votre boule d’amour !
          </p>
          <a href="/tarifs" className="bg-blue-600 hover:bg-orange-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-full text-base md:text-lg shadow-lg transform hover:scale-110 transition duration-300 drop-shadow-md">
            Réservez maintenant
          </a>
        </div>
      </section>
    </div>
  );
};

export default Hero;