import React from 'react';
import { Dog, Scissors, Home } from 'lucide-react';

const pricingPlans = [
  {
    title: 'Promenade de chien',
    price: '20€/heure',
    icon: <Dog className="h-10 w-10 text-blue-500" />,
    features: [
      'Balade 30–60 min',
      'Jouets inclus',
      'Photos après la promenade',
    ],
  },
  {
    title: 'Toilettage pour chat',
    price: '35€/séance',
    icon: <Scissors className="h-10 w-10 text-purple-500" />,
    features: [
      'Brossage complet',
      'Coupe des griffes',
      'Nettoyage des oreilles',
    ],
  },
  {
    title: 'Garde à domicile',
    price: '50€/nuit',
    icon: <Home className="h-10 w-10 text-green-500" />,
    features: [
      'Visites 3x/jour',
      'Repas inclus',
      'Rapport quotidien',
    ],
  },
];

const Tarifs: React.FC = () => {
  return (
    <section className="tarifs bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12 animate-in fade-in duration-700">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Nos Tarifs</h2>
        <p className="text-lg md:text-xl text-gray-700">
          Choisissez le forfait adapté à votre compagnon à poils
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {pricingPlans.map((plan, idx) => (
          <div
            key={idx}
            className="plan-card bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center transform hover:scale-105 transition duration-500 ease-out animate-in slide-in-from-bottom-5 delay-[calc(100ms*var(--idx))]"
            style={{ '--idx': idx } as React.CSSProperties}
          >
            <div className="mb-4">{plan.icon}</div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">{plan.title}</h3>
            <p className="text-xl font-bold text-blue-600 mb-4">{plan.price}</p>
            <ul className="mb-6 space-y-2 text-gray-600">
              {plan.features.map((feat, fidx) => (
                <li key={fidx}>• {feat}</li>
              ))}
            </ul>
            <button className="mt-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition duration-300">
              Réserver
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Tarifs;