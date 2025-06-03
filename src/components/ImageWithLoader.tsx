import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  src: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

const ImageWithLoader: React.FC<Props> = ({ src, alt, className = '', onClick }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded-lg ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-300" />
      )}
      <motion.img
        src={src}
        alt={alt}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={loaded ? { opacity: 1, scale: 1 } : {}}
        transition={{
          opacity: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] },
          scale: { type: 'spring', stiffness: 90, damping: 20 }
        }}
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        loading="lazy"
        className={`relative w-full h-auto object-cover cursor-pointer ${loaded ? '' : 'invisible'}`}
      />
    </div>
  );
};

export default ImageWithLoader;

