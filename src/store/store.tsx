"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  sku: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  badge?: "Nouveau" | "Populaire";
};

export default function BoutiqueCosy() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [flyingItem, setFlyingItem] = useState<{ image: string; x: number; y: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // 🔹 Cargar productos
  useEffect(() => {
    fetch("http://localhost:4000/payments-products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Erreur chargement produits :", err));
  }, []);

  // 🔹 Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  // 🔹 Guardar carrito en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 🔹 Funciones del carrito
  const addToCart = (product: Product, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setFlyingItem({ image: product.image, x: rect.left, y: rect.top });

    setCart(prev => {
      const exists = prev.find(p => p.sku === product.sku);
      if (exists) {
        return prev.map(p =>
          p.sku === product.sku ? { ...p, quantity: (p.quantity || 1) + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowCart(true);
  };

  const removeFromCart = (sku: string) => setCart(prev => prev.filter(item => item.sku !== sku));

  const updateQuantity = (sku: string, quantity: number) => {
    setCart(prev => prev.map(item =>
      item.sku === sku ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

const handleCheckout = async () => {
  if (cart.length === 0) return alert("Le panier est vide");

  setIsLoading(true);
  try {
    const res = await fetch("http://localhost:4000/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url; // redirige a Stripe
    } else {
      alert("Erreur lors de la création de la session de paiement");
    }
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la connexion à Stripe");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 mt-16 relative">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-10">
        PetStore 🐶🐱
      </h1>

      {/* Icono flotante carrito */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 bg-green-500 w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-white text-3xl z-40 hover:scale-110 transition-all"
      >
        🛒
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {cart.reduce((sum, item) => sum + (item.quantity || 0), 0)}
          </span>
        )}
      </button>

      {/* Grid productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <motion.div
            key={product.sku}
            className="bg-white rounded-3xl p-6 flex flex-col items-center shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative"
            whileHover={{ scale: 1.05 }}
          >
            {product.badge && (
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`absolute top-4 left-4 px-3 py-1 text-sm rounded-full text-white ${product.badge === "Nouveau" ? "bg-green-500" : "bg-yellow-500"}`}
              >
                {product.badge}
              </motion.span>
            )}
            <div className="w-56 h-56 rounded-2xl overflow-hidden mb-4 bg-gray-50 flex items-center justify-center">
              <motion.img
                src={product.image}
                alt={product.name}
                className="object-contain w-full h-full"
                whileHover={{ scale: 1.1, rotate: 3 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2 text-center">{product.name}</h2>
            <p className="text-lg font-semibold text-gray-600 mb-4">{product.price.toFixed(2)} €</p>
            <button
              onClick={(e) => addToCart(product, e)}
              className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all"
            >
              Ajouter 🛒
            </button>
          </motion.div>
        ))}
      </div>

      {/* Carrito full-screen */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold">Votre Panier</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">✕</button>
            </div>

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center mt-20">Le panier est vide</p>
              ) : cart.map(item => (
                <div key={item.sku} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-lg"/>
                  <div className="flex-1 mx-4">
                    <h3 className="font-semibold text-gray-700">{item.name}</h3>
                    <div className="flex items-center mt-1 gap-2">
                      <button
                        className="w-6 h-6 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-700 font-bold"
                        onClick={() => updateQuantity(item.sku, (item.quantity || 1) - 1)}
                      >-</button>
                      <span>{item.quantity}</span>
                      <button
                        className="w-6 h-6 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-700 font-bold"
                        onClick={() => updateQuantity(item.sku, (item.quantity || 1) + 1)}
                      >+</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-semibold">{(item.price * (item.quantity || 1)).toFixed(2)} €</span>
                    <button
                      onClick={() => removeFromCart(item.sku)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg"
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer con total y checkout */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-between text-xl font-bold mb-4">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold disabled:opacity-50"
                  >
                    {isLoading ? "Chargement..." : "Passer à la caisse"}
                  </button>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animación “fly to cart” */}
      <AnimatePresence>
        {flyingItem && (
          <motion.img
            src={flyingItem.image}
            alt=""
            className="w-20 h-20 rounded-xl fixed z-50 pointer-events-none"
            initial={{ x: flyingItem.x, y: flyingItem.y, scale: 1, rotate: 0 }}
            animate={{ x: window.innerWidth - 120, y: window.innerHeight - 120, scale: 0.3, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            onAnimationComplete={() => setFlyingItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
