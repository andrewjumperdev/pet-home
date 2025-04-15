import React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const Features: React.FC = () => {
  return (
    <section className="py-12 px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-orange-600">
        Pour vos amis à quatre pattes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[
          {
            emoji: "🐶🐱",
            title: "Cariño Total",
            desc: "Atención para perros y gatos",
          },
          {
            emoji: "🏞️",
            title: "Jardín Seguro",
            desc: "Espacio para explorar",
          },
          {
            emoji: "📷",
            title: "Fotos Diarias",
            desc: "Mira cómo se divierten",
          },
        ].map((feat, i) => (
          <div
            key={i}
            className="feature-card bg-white p-4 rounded-2xl shadow-lg transform hover:rotate-2 hover:scale-105 transition duration-300"
          >
            <div className="text-4xl md:text-5xl mb-3">{feat.emoji}</div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
              {feat.title}
            </h3>
            <p className="text-gray-600 text-sm">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
