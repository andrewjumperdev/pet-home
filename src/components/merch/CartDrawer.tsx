/**
 * Panneau latéral du panier d'achat
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Truck,
  Shield,
  Tag,
  Gift,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { usePrintfulStore } from '../../store/printfulStore';

export default function CartDrawer() {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getSubtotal,
    getTax,
    getTotal,
    getCartItemCount,
  } = usePrintfulStore();

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const itemCount = getCartItemCount();
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const hasFreeshipping = subtotal >= freeShippingThreshold;

  // Calcul de la réduction (10% si code promo)
  const discount = promoApplied ? subtotal * 0.10 : 0;
  const finalTotal = total - discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'PETHOME10') {
      setPromoApplied(true);
    }
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/store/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
          />

          {/* Panel del carrito */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b-2 border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Mon Panier</h2>
                {itemCount > 0 && (
                  <span className="bg-teal-500 text-white px-2.5 py-0.5 rounded-full text-sm font-bold">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Barre de livraison gratuite */}
            {cart.length > 0 && (
              <div className={`px-6 py-3 ${hasFreeshipping ? 'bg-teal-500' : 'bg-teal-50'} border-b border-teal-100`}>
                <div className={`flex items-center gap-2 text-sm ${hasFreeshipping ? 'text-white' : 'text-teal-800'}`}>
                  {hasFreeshipping ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-bold">Livraison GRATUITE débloquée !</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4" />
                      <span>
                        Plus que <strong>{remainingForFreeShipping.toFixed(2)}€</strong> pour la livraison gratuite
                      </span>
                    </>
                  )}
                </div>
                {!hasFreeshipping && (
                  <div className="mt-2 h-2 bg-teal-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Liste des produits */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Votre panier est vide</h3>
                  <p className="text-slate-600 mb-6">
                    Découvrez nos produits uniques
                  </p>
                  <button
                    onClick={() => {
                      closeCart();
                      navigate('/store');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-bold hover:from-teal-600 hover:to-cyan-600 transition-colors"
                  >
                    Voir les produits
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-contain rounded-lg bg-slate-50 border border-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{item.variantName}</p>
                        <p className="text-teal-600 font-bold mt-1">{item.price.toFixed(2)} €</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center bg-slate-50 rounded-lg border-2 border-slate-200">
                            <button
                              className="p-1.5 hover:bg-slate-100 transition-colors rounded-l-md"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3 text-slate-700" />
                            </button>
                            <span className="px-3 font-bold text-slate-900 text-sm">
                              {item.quantity}
                            </span>
                            <button
                              className="p-1.5 hover:bg-slate-100 transition-colors rounded-r-md"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3 text-slate-700" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Pied avec résumé et paiement */}
            {cart.length > 0 && (
              <div className="border-t-2 border-slate-100 p-6 space-y-4 bg-white">
                {/* Code promo */}
                {!promoApplied ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Code promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors text-sm"
                    >
                      Appliquer
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium text-sm">
                      Code PETHOME10 appliqué (-10%)
                    </span>
                    <button
                      onClick={() => setPromoApplied(false)}
                      className="ml-auto text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Résumé des prix */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Sous-total</span>
                    <span className="font-medium text-slate-900">{subtotal.toFixed(2)} €</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction (-10%)</span>
                      <span className="font-medium">-{discount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>TVA (21%)</span>
                    <span className="font-medium text-slate-900">{tax.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Livraison</span>
                    <span className="font-medium">
                      {hasFreeshipping ? (
                        <span className="text-teal-600 font-bold">Gratuite</span>
                      ) : (
                        <span className="text-slate-500">Calculée ensuite</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t-2 border-slate-200">
                    <span>Total</span>
                    <div className="text-right">
                      {promoApplied && (
                        <span className="text-sm text-slate-400 line-through mr-2">
                          {total.toFixed(2)} €
                        </span>
                      )}
                      <span className="text-teal-600">{finalTotal.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                {/* Urgence */}
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-700 text-sm font-medium">
                    Commandez avant 18h pour une expédition rapide
                  </span>
                </div>

                {/* Bouton de paiement */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-bold hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Payer {finalTotal.toFixed(2)} €
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Shield className="w-4 h-4 text-teal-500" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Truck className="w-4 h-4 text-teal-500" />
                    <span>Livraison suivie</span>
                  </div>
                </div>

                {/* Continuer les achats */}
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/store');
                  }}
                  className="w-full py-2 text-slate-500 font-medium hover:text-slate-700 transition-colors text-center text-sm"
                >
                  ← Continuer mes achats
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
