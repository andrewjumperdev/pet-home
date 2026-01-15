/**
 * Cliente API de Printful
 * Maneja todas las comunicaciones con la API de Printful
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// Tipos de Printful
export interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url: string;
  is_ignored: boolean;
}

export interface PrintfulVariant {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  main_category_id: number;
  warehouse_product_variant_id: number | null;
  retail_price: string;
  sku: string;
  currency: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  files: PrintfulFile[];
  options: PrintfulOption[];
  is_ignored: boolean;
}

export interface PrintfulFile {
  id: number;
  type: string;
  hash: string;
  url: string | null;
  filename: string;
  mime_type: string;
  size: number;
  width: number;
  height: number;
  dpi: number | null;
  status: string;
  created: number;
  thumbnail_url: string;
  preview_url: string;
  visible: boolean;
  is_temporary: boolean;
}

export interface PrintfulOption {
  id: string;
  value: string;
}

export interface PrintfulSyncProduct {
  sync_product: PrintfulProduct;
  sync_variants: PrintfulVariant[];
}

export interface PrintfulShippingRate {
  id: string;
  name: string;
  rate: string;
  currency: string;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  minDeliveryDate: string;
  maxDeliveryDate: string;
}

export interface PrintfulOrderItem {
  sync_variant_id: number;
  quantity: number;
  retail_price?: string;
}

export interface PrintfulRecipient {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state_code?: string;
  state_name?: string;
  country_code: string;
  country_name?: string;
  zip: string;
  phone?: string;
  email?: string;
}

export interface PrintfulOrder {
  id: number;
  external_id?: string;
  store: number;
  status: string;
  shipping: string;
  shipping_service_name: string;
  created: number;
  updated: number;
  recipient: PrintfulRecipient;
  items: PrintfulOrderItem[];
  retail_costs: {
    currency: string;
    subtotal: string;
    discount: string;
    shipping: string;
    tax: string;
    vat: string;
    total: string;
  };
}

export interface CreateOrderRequest {
  recipient: PrintfulRecipient;
  items: PrintfulOrderItem[];
  retail_costs?: {
    shipping?: string;
  };
}

// Cache simple para productos
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Cliente API
class PrintfulClient {
  private client: AxiosInstance;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    // Producción: https://api.maisonpourpets.com | Local: http://localhost:3000
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    this.client = axios.create({
      baseURL: `${baseURL}/api/printful`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Interceptor para logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[Printful API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[Printful API] Request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`[Printful API] Response:`, response.status);
        return response;
      },
      (error) => {
        console.error('[Printful API] Response error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error as AxiosError)) {
        console.log(`[Printful API] Retrying... (${this.maxRetries - retries + 1}/${this.maxRetries})`);
        await this.delay(this.retryDelay);
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status >= 500 || status === 429; // Server error or rate limit
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Obtiene todos los productos de la tienda
   */
  async getProducts(): Promise<PrintfulProduct[]> {
    const cacheKey = 'products';
    const cached = getCached<PrintfulProduct[]>(cacheKey);
    if (cached) {
      console.log('[Printful API] Returning cached products');
      return cached;
    }

    const response = await this.withRetry(() =>
      this.client.get<{ result: PrintfulProduct[] }>('/products')
    );

    const products = response.data.result;
    setCache(cacheKey, products);
    return products;
  }

  /**
   * Obtiene un producto específico con todas sus variantes
   */
  async getProduct(id: number): Promise<PrintfulSyncProduct> {
    const cacheKey = `product_${id}`;
    const cached = getCached<PrintfulSyncProduct>(cacheKey);
    if (cached) {
      console.log(`[Printful API] Returning cached product ${id}`);
      return cached;
    }

    const response = await this.withRetry(() =>
      this.client.get<{ result: PrintfulSyncProduct }>(`/products/${id}`)
    );

    const product = response.data.result;
    setCache(cacheKey, product);
    return product;
  }

  /**
   * Calcula costos de envío
   */
  async getShippingRates(
    recipient: PrintfulRecipient,
    items: PrintfulOrderItem[]
  ): Promise<PrintfulShippingRate[]> {
    const response = await this.withRetry(() =>
      this.client.post<{ result: PrintfulShippingRate[] }>('/shipping/rates', {
        recipient,
        items,
      })
    );

    return response.data.result;
  }

  /**
   * Crea una orden en Printful
   */
  async createOrder(order: CreateOrderRequest): Promise<PrintfulOrder> {
    const response = await this.withRetry(() =>
      this.client.post<{ result: PrintfulOrder }>('/orders', order)
    );

    return response.data.result;
  }

  /**
   * Obtiene el estado de una orden
   */
  async getOrder(orderId: number): Promise<PrintfulOrder> {
    const response = await this.withRetry(() =>
      this.client.get<{ result: PrintfulOrder }>(`/orders/${orderId}`)
    );

    return response.data.result;
  }

  /**
   * Confirma una orden (la envía a producción)
   */
  async confirmOrder(orderId: number): Promise<PrintfulOrder> {
    const response = await this.withRetry(() =>
      this.client.post<{ result: PrintfulOrder }>(`/orders/${orderId}/confirm`)
    );

    return response.data.result;
  }

  /**
   * Limpia la caché
   */
  clearCache(): void {
    cache.clear();
    console.log('[Printful API] Cache cleared');
  }
}

// Exportar instancia singleton
export const printfulClient = new PrintfulClient();

// Exportar tipos y utilidades
export type { AxiosError };
