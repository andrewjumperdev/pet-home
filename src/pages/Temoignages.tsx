import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Claire B.',
    comment: 'Mon chien a adoré son séjour chez PetHome. L\'équipe est adorable et très attentionnée !',
    stars: 5,
  },
  {
    name: 'Jean M.',
    comment: 'Service impeccable, ma chatte est revenue détendue et heureuse. Merci !',
    stars: 4,
  },
  {
    name: 'Lucie D.',
    comment: 'Ambiance familiale, photos envoyées chaque jour. Je recommande vivement.',
    stars: 5,
  },
  {
    name: 'Marc T.',
    comment: 'Très bon accueil, professionnels et passionnés par les animaux.',
    stars: 4,
  },
];

const Temoignages: React.FC = () => {
  return (
    <section className="bg-yellow-50 py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-blue-700 mb-4 animate-in fade-in slide-in-from-bottom-5">Témoignages</h2>
        <p className="text-base md:text-lg text-gray-600">Ce que nos clients disent de nous</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-xl p-6 animate-in fade-in slide-in-from-bottom-5"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center mb-2">
              {Array.from({ length: testimonial.stars }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
              ))}
            </div>
            <p className="text-gray-800 mb-4 italic">"{testimonial.comment}"</p>
            <p className="text-sm font-semibold text-blue-600">- {testimonial.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Temoignages;
