/**
 * Carte de produit pour le catalogue de merchandising
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye, Truck, Star, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrintfulProduct, PrintfulVariant } from '../../api/printful';
import { usePrintfulStore } from '../../store/printfulStore';

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

// Badges aleatorios para algunos productos
const badges = ['NOUVEAU', 'POPULAIRE', 'BEST-SELLER'];

interface ProductCardProps {
  product: PrintfulProduct;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const { fetchProductDetail, addToCart, openCart, productDetails } = usePrintfulStore();

  // Determinar si mostrar badge (basado en index para consistencia)
  const showBadge = index % 4 === 0;
  const badgeText = badges[index % badges.length];
  const badgeColor = index % 3 === 0 ? 'from-teal-500 to-cyan-500' :
                    index % 3 === 1 ? 'from-amber-500 to-orange-500' :
                    'from-purple-500 to-pink-500';

  // Cargar precio del producto
  useEffect(() => {
    const loadPrice = async () => {
      const cached = productDetails.get(product.id);
      if (cached && cached.sync_variants.length > 0) {
        setPrice(parseFloat(cached.sync_variants[0].retail_price));
        return;
      }

      const detail = await fetchProductDetail(product.id);
      if (detail && detail.sync_variants.length > 0) {
        setPrice(parseFloat(detail.sync_variants[0].retail_price));
      }
    };
    loadPrice();
  }, [product.id, fetchProductDetail, productDetails]);

  const handleViewProduct = () => {
    navigate(`/store/${product.id}`);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);

    try {
      // Obtener detalles del producto para añadir la primera variante
      const detail = await fetchProductDetail(product.id);
      if (detail && detail.sync_variants.length > 0) {
        const variant = detail.sync_variants[0];
        addToCart({
          variantId: variant.variant_id,
          syncVariantId: variant.id,
          productId: product.id,
          name: product.name,
          variantName: variant.name,
          price: parseFloat(variant.retail_price),
          image: getVariantImageUrl(variant, product.thumbnail_url),
          sku: variant.sku,
        });
        openCart();
      }
    } finally {
      setIsAdding(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-slate-100 hover:border-teal-200 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {/* Badge promo */}
        {showBadge && (
          <span className={`absolute top-3 left-3 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r ${badgeColor} text-white z-10 shadow-lg`}>
            {badgeText}
          </span>
        )}

        {/* Badge variantes */}
        {!showBadge && product.variants > 1 && (
          <span className="absolute top-3 left-3 px-3 py-1.5 text-xs font-bold rounded-full bg-slate-800 text-white z-10 shadow-lg">
            {product.variants} options
          </span>
        )}

        {/* Bouton favori */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 shadow-md ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white text-slate-400 hover:text-red-500 border-2 border-slate-100'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Image du produit */}
        <motion.img
          src={product.thumbnail_url}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay avec actions rapides */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent flex items-end justify-center pb-4 gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="px-6 py-3 bg-teal-500 rounded-xl flex items-center gap-2 text-white font-bold shadow-lg hover:bg-teal-600 transition-colors disabled:opacity-70"
          >
            {isAdding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
            <span>Ajouter</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewProduct}
            className="px-4 py-3 bg-white rounded-xl flex items-center gap-2 text-slate-900 font-bold shadow-lg hover:bg-slate-100 transition-colors"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4 bg-white">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          ))}
          <span className="text-xs text-slate-500 ml-1">(4.9)</span>
        </div>

        {/* Nom */}
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 min-h-[48px] group-hover:text-teal-600 transition-colors">
          {product.name}
        </h3>

        {/* Prix et livraison */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {price !== null ? (
              <span className="text-2xl font-bold text-slate-900">{price.toFixed(2)} €</span>
            ) : (
              <span className="text-slate-400">Chargement...</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
            <Truck className="w-3 h-3" />
            <span>Livraison UE</span>
          </div>
        </div>

        {/* Bouton */}
        <button
          onClick={handleQuickAdd}
          disabled={isAdding}
          className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg disabled:opacity-70"
        >
          {isAdding ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Ajout...
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              Ajouter au panier
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
