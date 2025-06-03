import React from "react";
import PawPrintsTrail from "./PawPrintsTrail";
import { Link } from "react-router-dom";
import CustomButton from "./CustomButton";

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
            className="text-4xl md:text-6xl font-extrabold mb-4 animate-[wiggle_1s_ease-in-out_infinite] drop-shadow-lg pb-5"
          >
            PetHome
          </h1>
          <p className="text-lg md:text-2xl mb-6 max-w-md mx-auto drop-shadow-md pb-5">
            Service de garderie <span className="text-blue-500 font-extrabold">privé</span><br /> pour chiens et chats<br /><br />
            Aventures, Câlins et Repos : les vacances rêvées pour votre boule d’amour !
          </p>
            <CustomButton
              label="Réservez"
              alt="Aller à la page de réservation"
              variant="primary"
              to="/tarifs"
            />
        </div>
      </section>
    </div>
  );
};

export default Hero;