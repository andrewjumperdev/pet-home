import React from "react";
import { Heart, Eye, Handshake, Star } from "lucide-react";

const teamPhotos = [
  "/carousel/1.jpg",
  "/carousel/2.jpg",
  "/carousel/3.jpg",
];

const APropos: React.FC = () => (
  <section className="bg-white text-gray-800 py-12 px-6 mt-20 sm:px-8 md:px-12 lg:mt-8 lg:px-20">
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-blue-400 mb-12">
        Qui sommes-nous?
      </h2>

      {/* Main Content with Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-start">
        {/* Left Text */}
        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            Nous sommes un couple passionné avec de très longues années d’expérience dans la garde et le bien-être des animaux.
          </p>
          <p>
            Mon mari, Andrew, a grandi dans une ferme au Costa Rica entouré de 7 chiens, 8 chats, des chevaux, des poules, des oies… et a été assistant vétérinaire pendant son adolescence. Il a un vrai don pour comprendre et éduquer les animaux mais est aussi attentionné, doux et joueur.
          </p>
          <p>
            Quant à moi, je m’appelle Justine. J’ai grandi en région parisienne, toujours entourée de chiens et de chats. Je suis très câline, joueuse et attentive à leurs besoins.
          </p>
          <p>
            Nous travaillons en télétravail ce qui nous permet d’être disponible 24h/24 et 7j/7 pour les animaux que nous gardons. Nous avons la chance d’habiter juste en face du grand parc Heller à Antony et d'une coulée verte qui s'étend sur de nombreux kms, parfait pour faire de belles et longues balades.
          </p>
          <p>
            Nous accueillons jusqu'à deux chiens/chats d'un SEUL propriétaire à la fois pour leur offrir toute notre attention.
          </p>
          <p>
            N’hésitez pas à nous contacter si vous avez une question, nous serons ravis de vous répondre ! On a hâte de rencontrer votre petite boule d’amour et de lui faire passer de merveilleuses vacances chez nous.
          </p>
        </div>

        {/* Right Photos Grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          <img
            src={teamPhotos[0]}
            alt="Photo équipe 1"
            className="object-cover w-full h-48 md:h-64 rounded-2xl"
          />
          <img
            src={teamPhotos[1]}
            alt="Photo équipe 2"
            className="object-cover w-full h-48 md:h-64 rounded-2xl"
          />
          <img
            src={teamPhotos[2]}
            alt="Photo équipe 3"
            className="object-cover w-full h-48 md:h-64 rounded-2xl col-span-2"
          />
        </div>
      </div>

      {/* Nos Valeurs */}
      <div className="mb-16">
        <h3 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Nos valeurs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3 p-4 border rounded-xl shadow-sm">
            <Heart className="w-6 h-6 text-red-500" />
            <span>Amour et respect</span>
          </div>
          <div className="flex items-center gap-3 p-4 border rounded-xl shadow-sm">
            <Eye className="w-6 h-6 text-yellow-500" />
            <span>Transparence</span>
          </div>
          <div className="flex items-center gap-3 p-4 border rounded-xl shadow-sm">
            <Handshake className="w-6 h-6 text-green-500" />
            <span>Confiance</span>
          </div>
          <div className="flex items-center gap-3 p-4 border rounded-xl shadow-sm">
            <Star className="w-6 h-6 text-indigo-500" />
            <span>Expérience</span>
          </div>
        </div>
      </div>

      {/* Question & CTA */}
      <div className="text-center mb-12">
        <h4 className="text-xl sm:text-2xl font-medium text-gray-700 mb-4">Une question?</h4>
        <div className="flex justify-center gap-4">
          <a href="/faq" className="bg-blue-200 hover:bg-blue-300 text-blue-800 font-medium py-2 px-6 rounded-full transition">FAQ</a>
          <a href="/contact" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-full transition">Contactez-nous</a>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-2xl mx-auto">
        <form className="bg-gray-50 p-6 rounded-2xl shadow-md space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Nom complet</label>
            <input type="text" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Votre nom" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input type="email" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Votre email" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Message</label>
            <textarea className="w-full border rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Votre message" />
          </div>
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full transition">Envoyer</button>
        </form>
      </div>
    </div>
  </section>
);

export default APropos;