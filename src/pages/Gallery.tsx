import React, { Suspense } from "react";
import SkeletonGallery from "../components/SkeletonGallery";
import Gallery from "../components/Gallerie";

// const Gallerie = React.lazy(() => import("../components/Gallerie"));

const images: string[] = [
  "/gallery-pethome/1.jpg",
  "/gallery-pethome/2.jpg",
  "/gallery-pethome/3.jpg",
  "/gallery-pethome/4.jpg",
  "/gallery-pethome/5.jpg",
  "/gallery-pethome/6.jpg",
  "/gallery-pethome/7.jpg",
  "/gallery-pethome/8.jpg",
  "/gallery-pethome/9.jpg",
  "/gallery-pethome/10.jpg",
  "/gallery-pethome/11.jpg",
  "/gallery-pethome/13.jpg",
  "/gallery-pethome/14.jpg",
  "/gallery-pethome/15.jpg",
  "/gallery-pethome/12.jpg",
  "/gallery-pethome/16.jpg",
];

const GalleryPage: React.FC = () => {
  return (
    <section>
      <Suspense fallback={<SkeletonGallery count={16} />}>
        <div className="p-8 mt-8">
          <Gallery images={images} />
        </div>
      </Suspense>
    </section>
  );
};

export default GalleryPage;
