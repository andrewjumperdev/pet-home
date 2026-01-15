/**
 * Card de producto para el catálogo de merchandising
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrintfulProduct } from '../../api/printful';
import { usePrintfulStore } from '../../store/printfulStore';

interface ProductCardProps {
  product: PrintfulProduct;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { fetchProductDetail, addToCart, openCart } = usePrintfulStore();

  const handleViewProduct = () => {
    navigate(`/store/${product.id}`);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();

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
        image: variant.product?.image || product.thumbnail_url,
        sku: variant.sku,
      });
      openCart();
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
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-slate-100 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
    >
      {/* Imagen */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {/* Badge de variantes */}
        {product.variants > 1 && (
          <span className="absolute top-3 left-3 px-3 py-1.5 text-xs font-bold rounded-full bg-amber-500 text-white z-10 shadow-lg">
            {product.variants} opciones
          </span>
        )}

        {/* Botón favorito */}
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

        {/* Imagen del producto */}
        <motion.img
          src={product.thumbnail_url}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay con acciones rápidas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-slate-900/40 flex items-center justify-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickAdd}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-lg hover:bg-slate-100 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleViewProduct}
            className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-teal-600 transition-colors"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4 bg-white">
        {/* Nombre */}
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 min-h-[48px]">
          {product.name}
        </h3>

        {/* Indicador de variantes */}
        <p className="text-sm text-slate-500 mb-3">
          {product.variants} variante{product.variants !== 1 ? 's' : ''} disponible{product.variants !== 1 ? 's' : ''}
        </p>

        {/* Botón */}
        <button
          onClick={handleViewProduct}
          className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg"
        >
          <Eye className="w-5 h-5" />
          Ver producto
        </button>
      </div>
    </motion.div>
  );
}
