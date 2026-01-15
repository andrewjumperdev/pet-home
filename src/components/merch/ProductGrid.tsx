/**
 * Grid de productos del catálogo de merchandising
 */

import { useEffect } from 'react';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { usePrintfulStore, useFilteredProducts } from '../../store/printfulStore';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const {
    isLoadingProducts,
    productsError,
    fetchProducts,
    searchQuery,
    setSearchQuery,
  } = usePrintfulStore();

  const filteredProducts = useFilteredProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  console.log('Filtered Products:', filteredProducts);

  // Estado de carga
  if (isLoadingProducts) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-50 rounded-2xl p-4 animate-pulse border-2 border-slate-100"
          >
            <div className="w-full aspect-square bg-slate-200 rounded-xl mb-4" />
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
            <div className="h-12 bg-slate-200 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  // Estado de error
  if (productsError) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Error al cargar productos</h3>
        <p className="text-slate-600 mb-6">{productsError}</p>
        <button
          onClick={() => fetchProducts()}
          className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Reintentar
        </button>
      </div>
    );
  }

  // Sin productos
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No se encontraron productos</h3>
        <p className="text-slate-600 mb-4">
          {searchQuery
            ? 'Prueba con otros términos de búsqueda'
            : 'Aún no hay productos disponibles'}
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Ver todos los productos
          </button>
        )}
      </div>
    );
  }

  // Grid de productos
  return (
    <>
      {/* Contador de resultados */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-600">
          <span className="font-bold text-slate-900">{filteredProducts.length}</span>{' '}
          producto{filteredProducts.length !== 1 ? 's' : ''} encontrado
          {filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </>
  );
}
