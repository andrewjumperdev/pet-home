import React, { useEffect } from 'react';
import PawPrint from './PawPrint';
import gsap from 'gsap';
import { ScrollTrigger, ScrollToPlugin } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const Hero: React.FC = () => {
//   useEffect(() => {
//     // Animación de las patitas
//     gsap.to('.paw', {
//       y: -15,
//       x: 5,
//       rotate: 10,
//       repeat: -1,
//       yoyo: true,
//       duration: 0.9,
//       ease: 'power1.inOut',
//       stagger: 0.15
//     });

//     // Animación del fondo con ScrollTrigger
//     gsap.to('.hero-bg', {
//       y: 100,
//       ease: 'none',
//       scrollTrigger: {
//         trigger: '.hero',
//         start: 'top top',
//         end: 'bottom top',
//         scrub: true
//       }
//     });

//     // Animación de entrada del texto, con force3D para mejorar la renderización
//     gsap.from('.hero-text', {
//       opacity: 0,
//       y: 50,
//       duration: 1.5,
//       ease: 'power3.out',
//       force3D: true
//     });
//   }, []);

  return (
    <section className="hero relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="hero-bg absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=2070')] bg-cover bg-center z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/80 to-transparent z-10"></div>
      <PawPrint className="absolute top-10 left-6 md:top-16 md:left-12 text-white paw z-20" />
      <PawPrint isCat className="absolute top-20 right-6 md:top-28 md:right-16 text-white paw z-20" />
      <PawPrint className="absolute bottom-12 left-16 md:bottom-20 md:left-24 text-white paw z-20" />
      <PawPrint isCat className="absolute bottom-20 right-8 md:bottom-28 md:right-20 text-white paw z-20" />
      <div className="hero-text text-center z-20 text-white px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-[wiggle_1s_ease-in-out_infinite]">
          PetHome
        </h1>
        <p className="text-lg md:text-2xl mb-6 max-w-md mx-auto">
          Amor y diversión para perros y gatos
        </p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-full text-base md:text-lg shadow-lg transform hover:scale-110 transition duration-300">
          Reserva Ahora
        </button>
      </div>
    </section>
  );
};

export default Hero;
