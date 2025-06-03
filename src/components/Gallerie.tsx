import React, { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import ImageWithLoader from './ImageWithLoader';

interface GalleryProps {
  images: string[];
}

const Gallery: React.FC<GalleryProps> = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const handleClick = (i: number) => {
    setIndex(i);
    setIsOpen(true);
  };

  return (
    <>
      <div className="columns-1 mt-12 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 p-4">
        {images.map((src, i) => (
          <div key={i} className="break-inside-avoid">
            <ImageWithLoader
              src={src}
              alt={`Gallery image ${i + 1}`}
              className="mb-4"
              onClick={() => handleClick(i)}
            />
          </div>
        ))}
      </div>

      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        index={index}
        slides={images.map((src) => ({ src }))}
      />
    </>
  );
};

export default Gallery;