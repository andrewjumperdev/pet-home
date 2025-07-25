import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import APropos from './pages/Apropos';
import GalleryPage from './pages/Gallery';
import FAQPage from './pages/FAQ';
import ContactPage from './pages/Contact';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';
import AdminPage from './pages/Admin';
import LoginPage from './pages/LoginPage';
import AdminRegister from './pages/AdminRegister';
import { ScrollToTop } from './components/ScrollToTop';
import Success from './pages/Success';
import Reviews from './pages/Reviews';

const App: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    document.body.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Cuidado de perros y gatos en casa con amor y diversión - PetHome, tu guardería de mascotas ideal"
        />
        <meta
          name="keywords"
          content="cuidado mascotas, guardería perros, pet sitter, cuidado gatos"
        />
        <meta name="robots" content="index, follow" />
        <title>PetHome - El Hogar de tus Perros y Gatos</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        {!isAdminRoute && <Navbar />}
        <main className="flex-grow">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tarifs" element={<Services />} />
            <Route path="/avis" element={<Reviews />} />
            <Route path="/apropos" element={<APropos />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin-register" element={<AdminRegister />} />
            <Route path="/success" element={ <Success/> } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </>
  );
};

export default App;
