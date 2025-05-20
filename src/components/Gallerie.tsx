import React from 'react';

interface GalleryProps {
  images: string[];
}

const Gallery: React.FC<GalleryProps> = ({ images }) => (
  <div className="columns-1 mt-12 sm:columns-2 md:mt-12 md:columns-3 lg:mt-8 lg:columns-4 gap-4 space-y-4 p-4">
    {images.map((src, idx) => (
      <div key={idx} className="break-inside-avoid">
        <img
          src={src}
          alt={`Gallery image ${idx + 1}`}
          className="w-full mb-4 rounded-lg object-cover"
          loading="lazy"
        />
      </div>
    ))}
  </div>
);

export default Gallery;
