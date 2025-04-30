import React from "react";
import { PawPrint } from "lucide-react";
import Carousel from "../components/Carousel";

const teamPhotos = [
    'carousel/1.jpg',
    'carousel/2.jpg',
    'carousel/3.jpg',
    'carousel/4.jpg',
    'carousel/5.jpg',
  ];

const APropos: React.FC = () => {
  return (
    <section className="bg-white text-gray-800 py-16 px-4 md:px-10 lg:px-20">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-blue-600">Qui sommes-nous?</h2>
        <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto">
        Nous sommes un couple passionné avec de très longues années d’expérience dans la garde et le bien-être des animaux.
        Mon mari, Andrew, a grandi dans une ferme entouré de 7 chiens, 8 chats, des chevaux, des poules, des oies, etc. et a été assistant vétérinaire pendant son adolescence. Il a un vrai don pour comprendre et éduquer les animaux. Il est très attentionné, doux, joueur.
        Quant à moi, je m’appelle Justine. J’ai grandi en région parisienne, toujours entourée de chiens et de chats. Je suis très câline, joueuse et attentive à leurs besoins.
        Mon mari et moi travaillons en télétravail ce qui nous permet d’être disponible 24h/24 et 7j/7 pour les animaux que nous gardons. Par conséquent, nous quittons très peu notre appartamment, seulement pour des occasions nécessaires, comme pour aller au supermarché. 
        N’hésitez pas à nous contacter si vous avez une question, nous serons ravis de vous répondre! 
        On a hâte de rencontrer votre petite boule d’amour et de lui faire passer de belles vacances chez nous :D
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-2 max-w-6xl mx-auto">
        <div className="flex flex-col items-start space-y-4">
          <h3 className="text-2xl font-semibold text-blue-500">Notre mission</h3>
          <p>
            Offrir un service de garde professionnel, affectueux et sécurisé, pour que chaque animal profite de son séjour pendant que ses humains sont absents.
          </p>

          <h3 className="text-2xl font-semibold text-blue-500">Nos valeurs</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Amour et respect des animaux</li>
            <li>Transparence avec les familles</li>
            <li>Confiance et sécurité</li>
            <li>Expérience positive pour chaque compagnon</li>
          </ul>
        </div>

        <div className="relative">
        <Carousel>
            {teamPhotos.map((src, i) => (
                <div key={i} className="rounded-3xl overflow-hidden shadow-lg">
                <img
                    src={src}
                    alt={`Notre équipe ${i + 1}`}
                    className="w-full h-64 object-cover"
                />
                </div>
            ))}
            </Carousel>
          <div className="absolute bottom-4 right-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
            <PawPrint className="w-5 h-5" /> Une équipe passionnée !
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h4 className="text-xl md:text-2xl font-medium text-gray-700 mb-4">
          En savoir plus ou réserver ?
        </h4>
        <button className="bg-blue-500 hover:bg-orange-500 text-white px-8 py-3 rounded-full transition duration-300">
          Contactez-nous
        </button>
      </div>
    </section>
  );
};

export default APropos;
