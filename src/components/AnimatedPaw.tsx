import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const AnimatedPaw: React.FC = () => {
  const pawRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const paw = pawRef.current;
    if (paw) {
      gsap.to(paw, {
        opacity: 0,
        scale: 0.5,
        duration: 1.5,
        ease: 'power1.inOut',
      });
    }
  }, []);

  return (
    <img
      ref={pawRef}
      src="https://i.ibb.co/JW3nKrKx/paws.png"
      alt="Paw"
      className="w-6 h-6"
    />
  );
};

export default AnimatedPaw;
