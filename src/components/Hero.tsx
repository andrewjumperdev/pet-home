import React from "react";
import PawPrintsTrail from "./PawPrintsTrail";

const Hero: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-yellow-50">
      <section className="hero relative h-full flex items-center justify-center overflow-hidden z-20">
        <div className="absolute inset-0 pointer-events-none z-30">
          <PawPrintsTrail />
        </div>
        <div
          className="absolute inset-0 bg-[url('/hero-small.webp')] bg-cover bg-center z-0 md:hidden"
        ></div>
        <div
          className="absolute inset-0 bg-[url('/hero-img.jpg')] bg-cover bg-center z-0 hidden md:block"
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-300/50 to-transparent z-10"></div>
        <div className="hero-text relative text-center z-20 text-white px-4">
          <h1 className="text-4xl text-white  md:text-blue-700 md:text-6xl font-extrabold mb-4 animate-[wiggle_1s_ease-in-out_infinite]">
            PetHome
          </h1>
          <p className="text-lg text-white  md:text-blue-700 md:text-2xl mb-6 max-w-md mx-auto">
            Câlins, rires et aventures pour chiens et chats heureux
          </p>
          <button className="bg-blue-500 hover:bg-orange-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-full text-base md:text-lg shadow-lg transform hover:scale-110 transition duration-300">
            Réservez maintenant
          </button>
        </div>
      </section>
    </div>
  );
};

export default Hero;
