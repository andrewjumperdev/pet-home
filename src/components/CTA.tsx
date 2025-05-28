import React from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const CTA: React.FC = () => {
//   useEffect(() => {
//     gsap.from('.cta-content', {
//       opacity: 0,
//       scale: 0.85,
//       duration: 1.5,
//       ease: 'elastic.out(1, 0.5)',
//       scrollTrigger: {
//         trigger: '.cta',
//         start: 'top 80%',
//       },
//     });
//   }, []);

  return (
    <section className="cta py-12 text-center bg-blue-400/75 text-white">
      <div className="cta-content px-4">
        <h2 className="text-2xl md:text-4xl font-bold mb-4 animate-pulse">Réservez votre bonheur !</h2>
        <p className="text-base md:text-xl mb-6 max-w-md mx-auto">Une maison pour chiens et chats</p>
        <Link to='/contact' className="bg-white text-blue-500 px-6 py-2 md:px-8 md:py-3 rounded-full text-base md:text-lg font-semibold shadow-lg hover:bg-blue-800 hover:text-white transition duration-300">
          Contactez-nous
        </Link>
      </div>
    </section>
  );
};

export default CTA;