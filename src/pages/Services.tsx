import React from 'react';
import { Dog, Cat } from 'lucide-react';

const services = [
  {
    title: 'Promenade de chien',
    description: "Offrez à votre compagnon à quatre pattes une promenade énergique et amusante.",
    icon: <Dog className="h-12 w-12 text-blue-500" />,
  },
  {
    title: 'Toilettage pour chat',
    description: 'Un toilettage minutieux pour garder votre chat propre et élégant.',
    icon: <Cat className="h-12 w-12 text-purple-500" />,
  },
  {
    title: 'Garde à domicile',
    description: "Nos pet sitters veillent sur votre animal pendant votre absence.",
    icon: <Dog className="h-12 w-12 text-green-500" />,
  },
  {
    title: 'Consultation vétérinaire',
    description: 'Accompagnement santé avec des pros pour un suivi rassurant.',
    icon: <Cat className="h-12 w-12 text-red-500" />,
  },
];

const Services: React.FC = () => {
  return (
    <section className="services bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto text-center mb-12 animate-in fade-in duration-700">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Nos Services</h2>
        <p className="text-lg md:text-xl text-gray-700">
          Découvrez nos soins et activités pour chiens et chats, pensés pour leur bonheur.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className={`service-card bg-white rounded-2xl p-6 shadow-lg transform hover:scale-105 transition duration-500 ease-out
              animate-in slide-in-from-bottom-5 delay-${index * 100}`}
          >
            <div className="icon mb-4">
              {service.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              {service.title}
            </h3>
            <p className="text-gray-600">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
