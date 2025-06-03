import React, { useEffect, useState, Suspense } from 'react';
import SkeletonGallery from '../components/SkeletonGallery';
import Gallery from '../components/Gallerie';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../lib/firebase';

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const snap = await getDocs(collection(db, "gallery"));
      const urls = snap.docs.map(doc => doc.data().url);
      setImages(urls);
    };

    fetchImages();
  }, []);

  return (
    <section className="p-8 mt-8">
      <Suspense fallback={<SkeletonGallery count={16} />}>
        <Gallery images={images} />
      </Suspense>
    </section>
  );
};

export default GalleryPage;
