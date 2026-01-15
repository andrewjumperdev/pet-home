/**
 * Store de Zustand para gestión de productos Printful y carrito
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  printfulClient,
  PrintfulProduct,
  PrintfulSyncProduct,
  PrintfulShippingRate,
  PrintfulRecipient,
} from '../api/printful';

// Tipos del carrito
export interface CartItem {
  variantId: number;
  syncVariantId: number;
  productId: number;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface ShippingAddress {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  stateCode?: string;
  countryCode: string;
  zip: string;
  phone?: string;
  email: string;
}

// Estado del store
interface PrintfulState {
  // Productos
  products: PrintfulProduct[];
  productDetails: Map<number, PrintfulSyncProduct>;
  isLoadingProducts: boolean;
  productsError: string | null;

  // Carrito
  cart: CartItem[];
  isCartOpen: boolean;

  // Checkout
  shippingAddress: ShippingAddress | null;
  shippingRates: PrintfulShippingRate[];
  selectedShippingRate: PrintfulShippingRate | null;
  isCalculatingShipping: boolean;

  // Filtros
  selectedCategory: string;
  searchQuery: string;
  priceRange: [number, number];

  // Acciones de productos
  fetchProducts: () => Promise<void>;
  fetchProductDetail: (id: number) => Promise<PrintfulSyncProduct | null>;

  // Acciones del carrito
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Acciones de checkout
  setShippingAddress: (address: ShippingAddress) => void;
  calculateShipping: () => Promise<void>;
  selectShippingRate: (rate: PrintfulShippingRate) => void;

  // Acciones de filtros
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setPriceRange: (range: [number, number]) => void;

  // Cálculos
  getSubtotal: () => number;
  getShippingCost: () => number;
  getTax: () => number;
  getTotal: () => number;
  getCartItemCount: () => number;
}

// Crear el store
export const usePrintfulStore = create<PrintfulState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      products: [],
      productDetails: new Map(),
      isLoadingProducts: false,
      productsError: null,

      cart: [],
      isCartOpen: false,

      shippingAddress: null,
      shippingRates: [],
      selectedShippingRate: null,
      isCalculatingShipping: false,

      selectedCategory: 'todos',
      searchQuery: '',
      priceRange: [0, 1000],

      // Acciones de productos
      fetchProducts: async () => {
        set({ isLoadingProducts: true, productsError: null });
        try {
          const products = await printfulClient.getProducts();
          set({ products, isLoadingProducts: false });
        } catch (error) {
          console.error('Error fetching products:', error);
          set({
            productsError: 'Error al cargar los productos. Por favor, intenta de nuevo.',
            isLoadingProducts: false,
          });
        }
      },

      fetchProductDetail: async (id: number) => {
        const { productDetails } = get();

        // Verificar si ya tenemos los detalles
        if (productDetails.has(id)) {
          return productDetails.get(id)!;
        }

        try {
          const detail = await printfulClient.getProduct(id);
          set({
            productDetails: new Map(productDetails).set(id, detail),
          });
          return detail;
        } catch (error) {
          console.error('Error fetching product detail:', error);
          return null;
        }
      },

      // Acciones del carrito
      addToCart: (item, quantity = 1) => {
        const { cart } = get();
        const existingIndex = cart.findIndex((i) => i.variantId === item.variantId);

        if (existingIndex >= 0) {
          const newCart = [...cart];
          newCart[existingIndex].quantity += quantity;
          set({ cart: newCart, isCartOpen: true });
        } else {
          set({
            cart: [...cart, { ...item, quantity }],
            isCartOpen: true,
          });
        }
      },

      removeFromCart: (variantId) => {
        const { cart } = get();
        set({ cart: cart.filter((item) => item.variantId !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        const { cart } = get();
        if (quantity <= 0) {
          get().removeFromCart(variantId);
          return;
        }
        const newCart = cart.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        );
        set({ cart: newCart });
      },

      clearCart: () => {
        set({
          cart: [],
          shippingAddress: null,
          shippingRates: [],
          selectedShippingRate: null,
        });
      },

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      // Acciones de checkout
      setShippingAddress: (address) => {
        set({ shippingAddress: address, shippingRates: [], selectedShippingRate: null });
      },

      calculateShipping: async () => {
        const { shippingAddress, cart } = get();
        if (!shippingAddress || cart.length === 0) return;

        set({ isCalculatingShipping: true });

        try {
          const recipient: PrintfulRecipient = {
            name: shippingAddress.name,
            company: shippingAddress.company,
            address1: shippingAddress.address1,
            address2: shippingAddress.address2,
            city: shippingAddress.city,
            state_code: shippingAddress.stateCode,
            country_code: shippingAddress.countryCode,
            zip: shippingAddress.zip,
            phone: shippingAddress.phone,
            email: shippingAddress.email,
          };

          const items = cart.map((item) => ({
            sync_variant_id: item.syncVariantId,
            quantity: item.quantity,
          }));

          const rates = await printfulClient.getShippingRates(recipient, items);
          set({
            shippingRates: rates,
            selectedShippingRate: rates[0] || null,
            isCalculatingShipping: false,
          });
        } catch (error) {
          console.error('Error calculating shipping:', error);
          set({ isCalculatingShipping: false });
        }
      },

      selectShippingRate: (rate) => {
        set({ selectedShippingRate: rate });
      },

      // Acciones de filtros
      setCategory: (category) => set({ selectedCategory: category }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setPriceRange: (range) => set({ priceRange: range }),

      // Cálculos
      getSubtotal: () => {
        const { cart } = get();
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getShippingCost: () => {
        const { selectedShippingRate } = get();
        return selectedShippingRate ? parseFloat(selectedShippingRate.rate) : 0;
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        // 21% IVA para España/UE
        return subtotal * 0.21;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getShippingCost() + get().getTax();
      },

      getCartItemCount: () => {
        const { cart } = get();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'printful-store',
      partialize: (state) => ({
        cart: state.cart,
        shippingAddress: state.shippingAddress,
      }),
    }
  )
);

// Selectores para productos filtrados
export const useFilteredProducts = () => {
  const { products, searchQuery } = usePrintfulStore();

  return products.filter((product) => {
    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!product.name.toLowerCase().includes(query)) {
        return false;
      }
    }

    return true;
  });
};
