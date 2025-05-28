import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "À propos", to: "/apropos" },
  { name: "Services et tarifs", to: "/tarifs" },
  { name: "Galerie", to: "/gallery" },
  { name: "Réservez", to: "/tarifs" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="text-white shadow-md fixed w-full z-50 bg-blue-400 backdrop-blur-sm">
      <div className="py-3 flex justify-between items-center mr-2 md:mr-20">
        <Link to="/" className="text-xl oregano text-white flex items-center ml-4">
          <img
            src="/icon.png"
            alt="Logo"
            className="h-8 w-8 mr-1 inline-block"/>
          <h1 className="font-oregano oregano-regular-italic">PetHome</h1>
        </Link>

        {/* Hamburger button for mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="p-2 focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Desktop links */}
        <ul className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.to}
                className="text-white font-bold hover:underline hover:decoration-white transition-colors duration-200"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <ul className="md:hidden bg-gradient-to-t from-sky-500 to-transparent px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="block text-white font-medium hover:decoration-white transition-colors duration-200"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
