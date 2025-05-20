import React from 'react';

interface SkeletonGalleryProps {
  count?: number;
}

const SkeletonGallery: React.FC<SkeletonGalleryProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-gray-200 h-48 rounded-lg"
        />
      ))}
    </div>
  );
};

export default SkeletonGallery;
