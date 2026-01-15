/**
 * Controlador de Printful
 * Maneja todas las comunicaciones con la API de Printful
 */

import axios from "axios";

// Cliente de Printful configurado
const printfulApi = axios.create({
  baseURL: "https://api.printful.com",
  headers: {
    Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    "Content-Type": "application/json",
    "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID,
  },
  timeout: 30000,
});

/**
 * GET /api/printful/products
 * Obtiene todos los productos de la tienda
 */
export const getProducts = async (req, res) => {
  try {
    const response = await printfulApi.get("/store/products");
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching products:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Error al obtener productos",
      details: error.response?.data?.error?.message || error.message,
    });
  }
};

/**
 * GET /api/printful/products/:id
 * Obtiene un producto específico con variantes
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await printfulApi.get(`/store/products/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Error fetching product ${req.params.id}:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Error al obtener producto",
      details: error.response?.data?.error?.message || error.message,
    });
  }
};

/**
 * POST /api/printful/shipping/rates
 * Calcula tarifas de envío
 */
export const getShippingRates = async (req, res) => {
  try {
    const { recipient, items } = req.body;

    if (!recipient || !items || items.length === 0) {
      return res.status(400).json({ error: "Se requiere recipient y items" });
    }

    const response = await printfulApi.post("/shipping/rates", { recipient, items });
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error calculating shipping:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Error al calcular envío",
      details: error.response?.data?.error?.message || error.message,
    });
  }
};

/**
 * POST /api/printful/orders
 * Crea una orden en Printful
 */
export const createOrder = async (req, res) => {
  try {
    const { recipient, items, retail_costs, paymentIntentId } = req.body;

    if (!recipient || !items || items.length === 0) {
      return res.status(400).json({ error: "Se requiere recipient y items" });
    }

    const orderData = {
      recipient,
      items,
      retail_costs,
      external_id: paymentIntentId,
    };

    // Crear orden en Printful
    const response = await printfulApi.post("/orders", orderData);
    const orderId = response.data.result.id;

    // Confirmar orden para producción
    const confirmResponse = await printfulApi.post(`/orders/${orderId}/confirm`);
    console.log(`✅ Order ${orderId} created and confirmed`);

    res.json(confirmResponse.data);
  } catch (error) {
    console.error("❌ Error creating order:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Error al crear orden",
      details: error.response?.data?.error?.message || error.message,
    });
  }
};

/**
 * GET /api/printful/orders/:id
 * Obtiene el estado de una orden
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await printfulApi.get(`/orders/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Error fetching order ${req.params.id}:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Error al obtener orden",
      details: error.response?.data?.error?.message || error.message,
    });
  }
};

/**
 * GET /api/printful/orders
 * Lista todas las órdenes
 */
export const getOrders = async (req, res) => {
  try {
    const { status, offset = 0, limit = 20 } = req.query;
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("offset", offset);
    params.append("limit", limit);

    const response = await printfulApi.get(`/orders?${params.toString()}`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching orders:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Error al obtener órdenes",
      details: error.response?.data?.error?.message || error.message,
    });
  }
};

/**
 * POST /api/printful/webhook
 * Webhook para eventos de Printful
 */
export const handleWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    console.log(`📦 Printful webhook: ${type}`);

    switch (type) {
      case "package_shipped":
        console.log(`✅ Order ${data.order.id} shipped`);
        console.log(`   Tracking: ${data.shipment.tracking_number}`);
        console.log(`   Carrier: ${data.shipment.carrier}`);
        // TODO: Enviar email al cliente con tracking
        break;

      case "order_created":
        console.log(`📝 Order ${data.order.id} created`);
        break;

      case "order_updated":
        console.log(`🔄 Order ${data.order.id} updated: ${data.order.status}`);
        break;

      case "order_failed":
        console.log(`❌ Order ${data.order.id} failed`);
        // TODO: Notificar al admin
        break;

      case "order_canceled":
        console.log(`🚫 Order ${data.order.id} canceled`);
        break;

      default:
        console.log(`❓ Unknown webhook type: ${type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(500).json({ error: "Error procesando webhook" });
  }
};
