import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonGalleryProps {
  count?: number;
}

// Alturas variadas para simular el efecto masonry
const heights = [
  'h-48', 'h-64', 'h-56', 'h-72', 'h-52', 'h-60',
  'h-68', 'h-44', 'h-80', 'h-56', 'h-64', 'h-48'
];

const SkeletonGallery: React.FC<SkeletonGalleryProps> = ({ count = 12 }) => {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className={`break-inside-avoid ${heights[i % heights.length]} rounded-2xl overflow-hidden relative`}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />

          {/* Placeholder icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonGallery;
