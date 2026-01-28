import React, { useEffect, useState } from 'react';
import SkeletonGallery from '../components/SkeletonGallery';
import Gallery from '../components/Gallerie';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      const snap = await getDocs(collection(db, "gallery"));
      const urls = snap.docs.map(doc => doc.data().url);
      setImages(urls);
      setIsLoading(false);
    };

    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Helmet>
        <title>Galerie - PetHome</title>
        <meta
          name="description"
          content="Découvrez les moments de bonheur de nos pensionnaires. Photos et souvenirs de leurs aventures chez PetHome."
        />
        <meta property="og:title" content="Galerie - PetHome" />
        <meta
          property="og:description"
          content="Découvrez les moments de bonheur de nos pensionnaires. Photos et souvenirs de leurs aventures chez PetHome."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-100 rounded-full opacity-50 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {isLoading ? 'Chargement...' : `${images.length} photos`}
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Notre{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
                Galerie
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Des moments de bonheur capturés au quotidien. Découvrez les aventures,
              les câlins et les sourires de nos adorables pensionnaires.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{images.length}+</div>
                <div className="text-sm text-gray-500 font-medium">Photos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">100%</div>
                <div className="text-sm text-gray-500 font-medium">Moments authentiques</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">7j/7</div>
                <div className="text-sm text-gray-500 font-medium">Photos envoyées</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {isLoading ? (
          <SkeletonGallery count={12} />
        ) : (
          <Gallery images={images} />
        )}
      </section>
    </div>
  );
};

export default GalleryPage;
