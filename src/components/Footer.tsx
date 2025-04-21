import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer bg-gradient-to-r from-blue-400 to-sky-400 text-white py-2">
      <div className="footer-content container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left animate-in fade-in duration-1000 ease-out">
        {/* Column 1: Branding & Description */}
        <div>
          <h3 className="text-2xl font-bold mb-4">PetHome</h3>
          <p className="text-sm md:text-base">
            Votre refuge pour chiens et chats, où chaque jour est une nouvelle aventure pleine de câlins et de sourires.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Liens rapides</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Accueil</a></li>
            <li><a href="#" className="hover:underline">Services</a></li>
            <li><a href="#" className="hover:underline">Tarifs</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Contact & Social */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Contactez-nous</h4>
          <p className="text-sm md:text-base mb-4">
            123 Rue des Animaux, 75000 Paris<br />
            +33 1 23 45 67 89<br />
            contact@pethome.com
          </p>
          <div className="flex justify-center md:justify-start space-x-4">
            <a href="#" aria-label="Facebook" className="hover:text-gray-200">
              {/* placeholder for icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12C22 6.477 17.523 2 12 2S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.99h-2.54v-2.888h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.888h-2.33v6.99C18.343 21.128 22 16.991 22 12z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm4.75-.875a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-white/30 pt-6 text-center text-sm opacity-90">
        © {new Date().getFullYear()} PetHome. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;
