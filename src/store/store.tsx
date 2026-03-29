/**
 * Page principale de la boutique - E-commerce avec Printful
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Heart,
  Package,
  Truck,
  Shield,
  RotateCcw,
  Star,
  Zap,
  Gift,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { usePrintfulStore } from './printfulStore';
import ProductGrid from '../components/merch/ProductGrid';
import CartDrawer from '../components/merch/CartDrawer';

const testimonials = [
  {
    name: "Marie L.",
    text: "J'adore mon t-shirt PetHome ! La qualité est top et le design est trop mignon.",
    rating: 5,
    product: "T-shirt Chat",
  },
  {
    name: "Thomas D.",
    text: "Livraison rapide et le mug est parfait. Je recommande à 100% !",
    rating: 5,
    product: "Mug Chien",
  },
  {
    name: "Sophie M.",
    text: "Cadeau parfait pour ma sœur qui adore les animaux. Elle était ravie !",
    rating: 5,
    product: "Sweat à capuche",
  },
];

export default function StorePage() {
  const { searchQuery, setSearchQuery, getCartItemCount, openCart } = usePrintfulStore();
  const cartItemCount = getCartItemCount();
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-white">
      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium">
          <Zap className="w-4 h-4" />
          <span>LIVRAISON OFFERTE dès 50€ d'achat</span>
          <span className="mx-2">•</span>
          <span className="hidden sm:inline">Paiement sécurisé</span>
          <span className="hidden sm:inline mx-2">•</span>
          <span className="hidden sm:inline">Retours gratuits 30 jours</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-16 px-4 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            {/* Badge promo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 rounded-full mb-6 shadow-lg"
            >
              <Gift className="w-5 h-5 text-white" />
              <span className="text-white font-bold">
                -10% avec le code PETHOME10
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Boutique{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                PetHome
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-300 max-w-2xl mx-auto mb-4"
            >
              Produits uniques conçus avec amour pour ceux qui aiment leurs animaux.
            </motion.p>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-slate-300">4.9/5 basé sur 120+ avis</span>
            </motion.div>

            {/* Barre de recherche */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>
            </motion.div>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: Truck, text: 'Livraison Europe', subtext: '5-10 jours', color: 'text-teal-400' },
              { icon: Shield, text: 'Paiement sécurisé', subtext: 'Stripe & CB', color: 'text-blue-400' },
              { icon: Package, text: 'Qualité premium', subtext: 'Print on demand', color: 'text-purple-400' },
              { icon: RotateCcw, text: 'Retours gratuits', subtext: '30 jours', color: 'text-amber-400' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/5 rounded-xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <item.icon className={`w-8 h-8 ${item.color}`} />
                <div>
                  <span className="text-white text-sm font-semibold block">{item.text}</span>
                  <span className="text-slate-400 text-xs">{item.subtext}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bouton flottant du panier */}
      <motion.button
        onClick={openCart}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-30 w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-full shadow-2xl flex items-center justify-center"
      >
        <ShoppingBag className="w-7 h-7" />
        {cartItemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center"
          >
            {cartItemCount}
          </motion.span>
        )}
      </motion.button>

      {/* Section produits */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Nos produits
            </h2>
            <p className="text-slate-600">Découvrez notre collection exclusive</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-teal-600 font-medium">
            <Clock className="w-5 h-5" />
            <span>Expédition sous 3-5 jours</span>
          </div>
        </div>
        <ProductGrid />
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-teal-600 font-semibold text-sm uppercase tracking-wider mb-2">
              Avis clients
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ce que disent nos clients
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">Acheté: {testimonial.product}</p>
                  </div>
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 font-bold">{testimonial.name[0]}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why buy section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Pourquoi acheter chez nous ?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Chaque achat soutient notre mission de prendre soin des animaux avec amour
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-100"
            >
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Qualité Premium
              </h3>
              <p className="text-slate-600">
                Produits fabriqués à la demande avec les meilleurs matériaux.
                Sans stock inutile, toujours frais pour vous.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-100"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Designs Uniques
              </h3>
              <p className="text-slate-600">
                Créations originales inspirées par l'amour des animaux.
                Des produits que vous ne trouverez nulle part ailleurs.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border-2 border-amber-100"
            >
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Achat Sécurisé
              </h3>
              <p className="text-slate-600">
                Paiement protégé avec Stripe. Livraisons traçables et retours
                gratuits pendant 30 jours.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            <Gift className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              -10% sur votre première commande
            </h2>
            <p className="text-teal-100 mb-8 text-lg">
              Inscrivez-vous et recevez votre code promo exclusif par email
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-teal-600 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <span>Recevoir</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
            <p className="text-teal-200 text-sm mt-4">
              Pas de spam, uniquement les nouveautés et offres exclusives
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-500 mb-4">Des questions ?</p>
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Contactez-nous à{' '}
            <a href="mailto:maisonpourpets@hotmail.com" className="text-teal-600 hover:underline">
              maisonpourpets@hotmail.com
            </a>
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-500" />
              <span>Livraison Europe</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-500" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-teal-500" />
              <span>Retours 30 jours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
