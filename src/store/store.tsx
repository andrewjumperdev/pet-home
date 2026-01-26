/**
 * Page principale de la boutique - E-commerce avec Printful
 */

import { motion } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Sparkles,
  Heart,
  Package,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { usePrintfulStore } from './printfulStore';
import ProductGrid from '../components/merch/ProductGrid';
import CartDrawer from '../components/merch/CartDrawer';

export default function StorePage() {
  const { searchQuery, setSearchQuery, getCartItemCount, openCart } = usePrintfulStore();
  const cartItemCount = getCartItemCount();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16 px-4 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-teal-500/20 px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span className="text-teal-300 font-semibold">
                Collection exclusive pour les amoureux des animaux
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
              className="text-xl text-slate-300 max-w-2xl mx-auto mb-8"
            >
              Produits uniques conçus avec amour pour ceux qui aiment leurs animaux.
              Qualité premium, impression à la demande.
            </motion.p>

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

          {/* Caractéristiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: Truck, text: 'Livraison dans toute l\'Europe', color: 'text-teal-400' },
              { icon: Shield, text: 'Paiement 100% sécurisé', color: 'text-blue-400' },
              { icon: Package, text: 'Impression à la demande', color: 'text-purple-400' },
              { icon: RotateCcw, text: '30 jours pour les retours', color: 'text-amber-400' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/5 rounded-xl p-4 backdrop-blur-sm"
              >
                <item.icon className={`w-6 h-6 ${item.color}`} />
                <span className="text-white text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bouton flottant du panier */}
      <button
        onClick={openCart}
        className="fixed bottom-6 right-6 z-30 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-800 transition-all hover:scale-110"
      >
        <ShoppingBag className="w-7 h-7" />
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-teal-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
      </button>

      {/* Grille de produits */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <ProductGrid />
      </section>

      {/* Section des avantages */}
      <section className="bg-slate-50 py-16 px-4">
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
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-100"
            >
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                <Package className="w-8 h-8 text-teal-600" />
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
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-100"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-blue-600" />
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
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-100"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-amber-600" />
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

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-600 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Vous voulez être informé des nouveaux produits ?
          </h2>
          <p className="text-teal-100 mb-8">
            Inscrivez-vous à notre newsletter et recevez 10% de réduction sur votre premier achat
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 px-6 py-4 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-teal-600 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </section>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
