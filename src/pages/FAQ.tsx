import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    id: 1,
    question: "🐾 Quels types d'animaux acceptez-vous ?",
    answer: <>Nous accueillons principalement les chiens et les chats, mais nous pouvons également prendre soin de petits animaux (lapins, rongeurs, oiseaux, etc.). Dans ce cas, nous vous invitons à nous <Link to="/contact" className="text-blue-600 underline">contacter via le formulaire de contact</Link>.</>
  },
  {
    id: 2,
    question: "📍 Où se trouve la garderie ?",
    answer: "La garderie se trouve dans notre appartement de 60 m² à Antony (Île-de-France), en face d'un parc et de la coulée verte qui s'étend sur de nombreux kilomètres jusqu'à Paris."
  },
  {
    id: 3,
    question: "🕒 Quels sont les horaires d'arrivée et de départ ?",
    answer: "Les horaires varient selon les propriétaires, mais en général, l'arrivée et le départ des animaux se font entre 8 h et 20 h. Une flexibilité peut être proposée sur demande."
  },
  {
    id: 4,
    question: "📅 Comment réserver une garde ?",
    answer: "Vous pouvez réserver directement via notre site en choisissant la formule, les dates souhaitées, le type et le nombre d'animaux."
  },
  {
    id: 5,
    question: "📑 Que dois-je fournir pour la garde ?",
    answer: (
      <ul className="list-disc list-inside space-y-1">
        <li>La nourriture de votre animal</li>
        <li>Ses accessoires (jouets, panier, laisse, gamelles, etc.)</li>
        <li>
          Une note contenant toutes les informations relatives à l'animal&nbsp;:
          <ul className="list-circle list-inside ml-4 space-y-1">
            <li>Heure et quantité des repas</li>
            <li>Allergies et antécédents médicaux</li>
            <li>Caractère (sociable, éducatif, propreté, etc.)</li>
            <li>Toute autre spécificité</li>
          </ul>
        </li>
      </ul>
    )
  },
  {
    id: 6,
    question: "💉 Mon animal doit-il être vacciné ?",
    answer: "Oui, pour la sécurité de tous les animaux, les vaccins doivent être à jour. Nous demandons également un traitement antiparasitaire récent."
  },
  {
    id: 7,
    question: "🐕 Mon chien sera-t-il en contact avec d'autres animaux ?",
    answer: "Le chien ou le chat est généralement accueilli seul. Toutefois, nous pouvons recevoir jusqu'à deux animaux de deux propriétaires différents en même temps, uniquement avec l'accord préalable de leurs propriétaires."
  },
  {
    id: 8,
    question: "📸 Aurai-je des nouvelles pendant la garde ?",
    answer: "Oui. Nous envoyons des photos et vidéos au quotidien."
  },
  {
    id: 9,
    question: "🛑 Puis-je annuler ma réservation ?",
    answer: (
      <div className="space-y-2">
        <p>Oui, selon nos Conditions Générales de Vente :</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>≥ 7 jours</strong> avant le début : remboursement total.</li>
          <li><strong>7 jours à 72 h</strong> avant : remboursement à 50 %.</li>
          <li><strong>≤ 72 h</strong> avant : aucun remboursement.</li>
        </ul>
      </div>
    )
  },
  {
    id: 10,
    question: "💬 Et si j'ai une urgence ou une question pendant la garde ?",
    answer: "Vous pouvez nous contacter directement 7 j/7 pour toute question ou urgence."
  }
];

const FAQPage: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => setOpenId(openId === id ? null : id);

  return (
    <section className="max-w-4xl mx-auto py-12 px-4 mt-20">
      <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">FAQ</h2>
      <div className="space-y-4">
        {faqs.map(({ id, question, answer }) => (
          <div key={id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggle(id)}
              className="w-full flex justify-between items-center py-4 px-6 focus:outline-none"
            >
              <span className="text-left text-lg font-medium text-gray-700">{question}</span>
              {openId === id ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openId === id && (
              <div className="px-6 pb-4 text-gray-600">
                {answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQPage;
