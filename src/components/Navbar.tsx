import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "À propos", to: "/apropos" },
  { name: "Services", to: "/tarifs" },
  { name: "Gallerie", to: "/gallery" },
  { name: "Réservez", to: "/tarifs" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="text-white shadow-md fixed w-full z-50 bg-white/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-500 uppercase flex items-center">
          <img
            src="/icon.png"
            alt="Logo"
            className="h-8 w-8 mr-2 inline-block"/>
          <span>PetHome</span>
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
                className="text-blue-500 font-bold hover:underline hover:decoration-indigo-500 transition-colors duration-200"
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
                className="block text-blue-700 font-medium hover:text-blue-400 transition-colors duration-200"
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
