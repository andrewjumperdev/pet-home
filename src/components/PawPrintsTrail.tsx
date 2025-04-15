import React, { useState, useEffect } from 'react';
import AnimatedPaw from './AnimatedPaw';

const PawPrintsTrail: React.FC = () => {
  const [pawPositions, setPawPositions] = useState<any[]>([]);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [lastPosition, setLastPosition] = useState<any>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      setIsMoving(true);
      setLastPosition(newPosition);


      setPawPositions((prevPositions) => {
        if (prevPositions.length > 900000) { 
          prevPositions.shift();
        }
        return [...prevPositions, newPosition];
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {pawPositions.map((position, index) => (
        <div
          key={index}
          className="paw-container absolute"
          style={{
            left: `${position.x - 20 + Math.random() * 10}px`,
            top: `${position.y - 20 + Math.random() * 10}px`,
            animationDelay: `${index * 0.1}s`,
            transition: 'all 0.8s ease-out',
          }}
        >
        <div/>

        <div className="">
          <AnimatedPaw />

        </div>
        </div>
      ))}
    </div>
  );
};

export default PawPrintsTrail;
