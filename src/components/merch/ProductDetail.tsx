/**
 * Vue de détail du produit avec variantes
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Check,
} from 'lucide-react';
import { usePrintfulStore } from '../../store/printfulStore';
import { PrintfulVariant } from '../../api/printful';
import CartDrawer from './CartDrawer';

// Función helper para obtener la mejor imagen del mockup
const getVariantImageUrl = (variant: PrintfulVariant | null, fallbackUrl: string): string => {
  if (!variant) return fallbackUrl;

  // Buscar imagen de preview (mockup con diseño)
  const previewFile = variant.files?.find(f => f.type === 'preview');
  if (previewFile?.preview_url) return previewFile.preview_url;

  // Fallback a thumbnail del archivo
  const defaultFile = variant.files?.find(f => f.type === 'default');
  if (defaultFile?.preview_url) return defaultFile.preview_url;
  if (defaultFile?.thumbnail_url) return defaultFile.thumbnail_url;

  // Fallback a imagen del producto
  return variant.product?.image || fallbackUrl;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchProductDetail, productDetails, addToCart, openCart } = usePrintfulStore();

  const [selectedVariant, setSelectedVariant] = useState<PrintfulVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const productId = parseInt(id || '0');
  const product = productDetails.get(productId);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      const detail = await fetchProductDetail(productId);
      if (detail && detail.sync_variants.length > 0) {
        setSelectedVariant(detail.sync_variants[0]);
      }
      setIsLoading(false);
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, fetchProductDetail]);

  const handleAddToCart = () => {
    if (!selectedVariant || !product) return;

    addToCart(
      {
        variantId: selectedVariant.variant_id,
        syncVariantId: selectedVariant.id,
        productId: product.sync_product.id,
        name: product.sync_product.name,
        variantName: selectedVariant.name,
        price: parseFloat(selectedVariant.retail_price),
        image: getVariantImageUrl(selectedVariant, product.sync_product.thumbnail_url),
        sku: selectedVariant.sku,
      },
      quantity
    );

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    openCart();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <div className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />
            </div>
            <div className="lg:w-1/2 space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-24 bg-slate-200 rounded" />
              <div className="h-12 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Produit non trouvé</h2>
          <button
            onClick={() => navigate('/store')}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  const { sync_product, sync_variants } = product;

  // Helper local que usa el thumbnail del producto como fallback
  const getVariantImage = (variant: PrintfulVariant | null): string => {
    return getVariantImageUrl(variant, sync_product.thumbnail_url);
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate('/store')}
          className="mb-8 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au catalogue
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100 relative"
            >
              <img
                src={getVariantImage(selectedVariant)}
                alt={sync_product.name}
                className="w-full h-full object-contain p-8"
              />

              {/* Bouton favori */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-slate-400 hover:text-red-500 border-2 border-slate-100'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </motion.div>

            {/* Thumbnails de variantes */}
            {sync_variants.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {sync_variants.slice(0, 6).map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'border-teal-500 ring-2 ring-teal-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={getVariantImage(variant)}
                      alt={variant.name}
                      className="w-full h-full object-contain bg-slate-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{sync_product.name}</h1>

              {/* Prix */}
              {selectedVariant && (
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-teal-600">
                    {parseFloat(selectedVariant.retail_price).toFixed(2)} €
                  </span>
                  <span className="text-sm text-slate-500">TVA incluse</span>
                </div>
              )}

              {/* Sélecteur de variantes */}
              {sync_variants.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    Sélectionnez une variante
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sync_variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          selectedVariant?.id === variant.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {variant.name.replace(sync_product.name, '').trim() || variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-900 mb-3">Quantité</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-slate-200 rounded-l-xl transition-colors"
                    >
                      <Minus className="w-5 h-5 text-slate-700" />
                    </button>
                    <span className="px-6 font-bold text-slate-900 text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-slate-200 rounded-r-xl transition-colors"
                    >
                      <Plus className="w-5 h-5 text-slate-700" />
                    </button>
                  </div>

                  {selectedVariant && (
                    <span className="text-slate-600">
                      Total :{' '}
                      <span className="font-bold text-slate-900">
                        {(parseFloat(selectedVariant.retail_price) * quantity).toFixed(2)} €
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!selectedVariant}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    addedToCart
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Ajouté
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      Ajouter au panier
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  disabled={!selectedVariant}
                  className="flex-1 py-4 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Acheter maintenant
                </motion.button>
              </div>

              {/* Caractéristiques */}
              <div className="space-y-4 p-6 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Livraison dans toute l'Europe</p>
                    <p className="text-sm text-slate-500">Gratuite à partir de 50€</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Paiement 100% sécurisé</p>
                    <p className="text-sm text-slate-500">Stripe avec cryptage SSL</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Retours gratuits</p>
                    <p className="text-sm text-slate-500">30 jours pour les échanges</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Description</h2>
                <p className="text-slate-600 leading-relaxed">
                  Produit de haute qualité imprimé à la demande. Chaque article est fabriqué
                  spécialement pour vous lorsque vous passez votre commande, garantissant
                  fraîcheur et personnalisation. Matériaux premium sélectionnés pour leur
                  durabilité et leur confort.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
