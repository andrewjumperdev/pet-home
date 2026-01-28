import React from "react";
import CustomButton from "./CustomButton";

const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full" />
      </div>

      {/* Paw pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="paws" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="5" cy="5" r="2" fill="white" />
            <circle cx="15" cy="15" r="2" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#paws)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center text-white">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-8 backdrop-blur-sm">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Prêt à offrir les meilleures<br />
            vacances à votre compagnon ?
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Rejoignez les centaines de familles qui nous font confiance.
            Places limitées, réservez dès maintenant !
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <CustomButton
              label="Réserver maintenant"
              alt="Aller à la page de réservation"
              variant="secondary"
              to="/tarifs"
              className="!bg-white !text-blue-600 hover:!bg-yellow-50"
            />
            <CustomButton
              label="Nous contacter"
              alt="Aller à la page contact"
              variant="secondary"
              to="/contact"
              className="!bg-transparent !border-white !text-white hover:!bg-white/10"
            />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Annulation gratuite 48h avant</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Visite découverte offerte</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Paiement sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
