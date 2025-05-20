import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-400 to-sky-400 text-white py-8">
      {/* Upper Footer */}
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Branding & Description */}
        <div>
          <h3 className="text-2xl font-bold mb-4">PetHome</h3>
          <p className="text-sm md:text-base">
            Votre refuge pour chiens et chats, où chaque jour est une nouvelle aventure pleine de câlins et de sourires.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Liens rapides</h4>
          <ul className="space-y-2">
            <li><a href="/home" className="hover:underline">Accueil</a></li>
            <li><a href="/services" className="hover:underline">Services</a></li>
            <li><a href="/tarifs" className="hover:underline">Réservez</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Contactez-nous</h4>
          <p className="text-sm md:text-base mb-4">
            France, Paris<br />
            contact@pethome.com
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 border-t border-white/30 pt-6">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 items-center text-sm opacity-90">
          {/* Left Links */}
          <div className="flex justify-center md:justify-start space-x-4 mb-4 md:mb-0">
            <a href="#" className="hover:underline">En savoir plus</a>
            <a href="/tarifs" className="hover:underline">Réservez</a>
            <a href="/contact" className="hover:underline">Nous contacter</a>
            <a href="/FaQ" className="hover:underline">FAQ</a>
          </div>
          {/* Center Legal */}
          <div className="text-center mb-4 md:mb-0">
            <a href="/FAQ" className="hover:underline">Mentions légales</a>
          </div>
          {/* Right Copyright */}
          <div className="flex justify-center md:justify-end space-x-2">
            <span>HomePet</span>
            <span>© {new Date().getFullYear()} Jumper Enterprise. Tous droits réservés</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
