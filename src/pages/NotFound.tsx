import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Parallax from 'parallax-js';

const NotFound: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let parallaxInstance: any;
    if (sceneRef.current) {
      parallaxInstance = new Parallax(sceneRef.current, {
        relativeInput: true,
        hoverOnly: true,
        pointerEvents: true,
      });
    }
    return () => parallaxInstance && parallaxInstance.disable();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 p-6 overflow-hidden">
      <div
        ref={sceneRef}
        className="w-96 h-96 mb-8 relative"
        id="parallax-scene"
      >
        {/* Dog layer bottom-left */}
        {/* <div data-depth="0.2" className="absolute w-40 h-40 bottom-0 left-0 z-10">
          <img
            src="/images/dog_small.gif"
            alt="Chien perdu"
            className="w-full h-full object-contain"
          />
        </div> */}
        {/* Cat layer top-right */}
        <div data-depth="0.8" className="absolute top-0 right-0 z-20">
          <img
            src="/images/cat.gif"
            alt="Chat perdu"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <h1 className="text-5xl font-extrabold mb-4 text-blue-700 animate-fade-in-down">
        Oups ! Page introuvable
      </h1>
      <p className="text-lg text-gray-600 mb-6 animate-fade-in-up">
        Nos petites mascottes n'ont pas trouvé ce que vous cherchez.
      </p>
      <Link
        to="/"
        className="relative inline-block px-8 py-3 font-medium group"
      >
        <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-1 translate-y-1 bg-blue-500 group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
        <span className="absolute inset-0 w-full h-full bg-white border-2 border-blue-500 group-hover:bg-blue-500"></span>
        <span className="relative text-blue-500 group-hover:text-white">
          Retour à l'accueil
        </span>
      </Link>
    </div>
  );
};

export default NotFound;
