import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-400 text-white text-sm">
      {/* Upper Footer */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {/* Column 1: Navigation */}
        <div className="text-center sm:text-left space-y-2">
          <ul className="space-y-1">
            <li><Link to="/apropos" className="hover:underline">En savoir plus</Link></li>
            <li><Link to="/tarifs" className="hover:underline">Réservez</Link></li>
            <li><Link to="/contact" className="hover:underline">Nous contacter</Link></li>
            <li><Link to="/FAQ" className="hover:underline">FAQ</Link></li>
          </ul>
        </div>

        {/* Column 2: Contact & Social */}
        <div className="text-center sm:text-left space-y-2">
          <p><i className="fa-solid fa-location-dot mr-2"></i>Antony, Île-de-France</p>
          <Link
            to="https://www.instagram.com/maisonpourpets"
            className="inline-flex items-center gap-2 hover:text-blue-200 transition-colors"
            target='_blank'
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-instagram text-xl"></i>
            <span>@maisonpourpets</span>
          </Link>
        </div>

        {/* Column 3: Logo & Description */}
        <div className="text-center sm:text-left space-y-2">
          <div className="flex justify-center sm:justify-start items-center gap-3">
            <img src="/icon.png" alt="Logo" className="h-10 w-10" />
            <span className="font-oregano oregano-regular-italic text-xl">PetHome</span>
          </div>
          <p className="max-w-xs mx-auto sm:mx-0">
            PetHome, La maison de vacances adoptée par vos chiens et chats.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/30 mt-8 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <Link to="/FAQ" className="hover:underline">
            Mentions légales
          </Link>
          <p className="opacity-90">
            © {new Date().getFullYear()} Jumper Enterprise. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
