import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from './components/Hero';
import Features from './components/Features';
import ParallaxSection from './components/ParallaxSection';
import CTA from './components/CTA';

const App: React.FC = () => {
  useEffect(() => {
    document.body.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Cuidado de perros y gatos en casa con amor y diversión - PetHome, tu guardería de mascotas ideal" />
        <meta name="keywords" content="cuidado mascotas, guardería perros, pet sitter, cuidado gatos" />
        <meta name="robots" content="index, follow" />
        <title>PetHome - El Hogar de tus Perros y Gatos</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-yellow-50">
        <Hero />
        <Features />
        <ParallaxSection />
        <CTA />
      </div>
    </>
  );
};

export default App;