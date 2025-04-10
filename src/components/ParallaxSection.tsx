import React, { useEffect } from 'react';
import gsap from 'gsap';

const ParallaxSection: React.FC = () => {
//   useEffect(() => {
//     gsap.to('.parallax-bg', {
//       y: 120,
//       ease: 'none',
//       scrollTrigger: {
//         trigger: '.parallax',
//         start: 'top bottom',
//         end: 'bottom top',
//         scrub: true
//       }
//     });

//     gsap.from('.parallax-text', {
//       opacity: 0,
//       y: 30,
//       duration: 1,
//       ease: 'power2.out',
//       scrollTrigger: {
//         trigger: '.parallax',
//         start: 'top 80%'
//       }
//     });
//   }, []);

  return (
    <section className="parallax relative py-16 bg-gray-100 overflow-hidden">
      <div className="parallax-bg absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518719046884-83d9e0d169ac?q=80&w=2070')] bg-cover bg-center z-0"></div>
      <div className="parallax-text relative z-10 text-center text-white px-4">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">¡Para Perros y Gatos!</h2>
        <p className="text-base md:text-xl max-w-lg mx-auto">Juegos y mimos para todos tus amigos peludos.</p>
      </div>
    </section>
  );
};

export default ParallaxSection;
