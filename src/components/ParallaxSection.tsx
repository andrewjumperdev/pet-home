'use client';

import React from 'react';

const ParallaxSection: React.FC = () => (
  <section className="relative h-[50vh] overflow-hidden">
    {/* Parallax background */}
    <div
      className="absolute inset-0 bg-fixed bg-center bg-cover z-0"
      style={{
        backgroundImage: "url('/parallax.jpg')",
      }}
    />

    {/* Dark overlay for contrast */}
    <div className="absolute inset-0 bg-black/60 z-10" />

    {/* Content container */}
    <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-4">
      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
        Pour chiens et chats !
      </h2>
      <p className="text-base md:text-xl lg:text-2xl max-w-xl mx-auto">
        Jeux et câlins pour tous vos amis à fourrure.
      </p>
    </div>
  </section>
);
export default ParallaxSection;