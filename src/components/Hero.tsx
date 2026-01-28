import React from "react";
import PawPrintsTrail from "./PawPrintsTrail";
import CustomButton from "./CustomButton";

const Hero: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-yellow-50">
      <section className="hero relative min-h-screen flex items-center justify-center overflow-hidden z-20">
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

        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30 z-10"></div>

        {/* Hero content */}
        <div className="hero-text relative z-20 text-white px-4 py-20 max-w-4xl mx-auto">
          {/* Badge de confianza */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-blue-500/90 text-white text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Garderie exclusive - Maximum 2 animaux
            </span>
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg animate-[wiggle_1s_ease-in-out_infinite]">
            PetHome
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-3xl font-light mb-4 drop-shadow-md">
            Service de garderie <span className="text-blue-400 font-bold">privé</span> pour chiens et chats
          </p>

          {/* Propuesta de valor */}
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90 leading-relaxed">
            Aventures, câlins et repos : les vacances rêvées pour votre boule d'amour !
            <br />
            <span className="text-blue-300 font-medium">Partez l'esprit tranquille.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <CustomButton
              label="Réserver maintenant"
              alt="Aller à la page de réservation"
              variant="primary"
              to="/tarifs"
            />
            <CustomButton
              label="Découvrir nos services"
              alt="Voir nos services"
              variant="secondary"
              to="/tarifs"
            />
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>5.0 sur Rover</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>100% de confiance</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Soins personnalisés</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>
    </div>
  );
};

export default Hero;