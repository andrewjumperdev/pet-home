/**
 * Servidor Express para el backend de Printful y Stripe
 * Maneja las comunicaciones seguras con las APIs
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Stripe = require('stripe');

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Configurar cliente de Printful
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID;
const printfulApi = axios.create({
  baseURL: 'https://api.printful.com',
  headers: {
    Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    'Content-Type': 'application/json',
    'X-PF-Store-Id': PRINTFUL_STORE_ID,
  },
  timeout: 30000,
});

console.log('Printful Store ID:', PRINTFUL_STORE_ID);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Webhook de Stripe necesita raw body
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// RUTAS DE PRINTFUL
// ============================================

/**
 * GET /api/printful/products
 * Obtiene todos los productos de la tienda
 */
app.get('/api/printful/products', async (req, res) => {
  try {
    const response = await printfulApi.get('/store/products');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al obtener productos',
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

/**
 * GET /api/printful/products/:id
 * Obtiene un producto específico con variantes
 */
app.get('/api/printful/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await printfulApi.get(`/store/products/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching product ${req.params.id}:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al obtener producto',
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

/**
 * POST /api/printful/shipping/rates
 * Calcula tarifas de envío
 */
app.post('/api/printful/shipping/rates', async (req, res) => {
  try {
    const { recipient, items } = req.body;

    if (!recipient || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Se requiere recipient y items',
      });
    }

    const response = await printfulApi.post('/shipping/rates', {
      recipient,
      items,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error calculating shipping:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al calcular envío',
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

/**
 * POST /api/printful/orders
 * Crea una orden en Printful
 */
app.post('/api/printful/orders', async (req, res) => {
  try {
    const { recipient, items, retail_costs, paymentIntentId } = req.body;

    if (!recipient || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Se requiere recipient y items',
      });
    }

    // Crear orden en Printful (draft - no se envía automáticamente)
    const orderData = {
      recipient,
      items,
      retail_costs,
      external_id: paymentIntentId, // Vincular con el pago de Stripe
    };

    const response = await printfulApi.post('/orders', orderData);

    // Confirmar la orden para que entre en producción
    const orderId = response.data.result.id;
    const confirmResponse = await printfulApi.post(`/orders/${orderId}/confirm`);

    console.log(`Order ${orderId} created and confirmed`);

    res.json(confirmResponse.data);
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al crear orden',
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

/**
 * GET /api/printful/orders/:id
 * Obtiene el estado de una orden
 */
app.get('/api/printful/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await printfulApi.get(`/orders/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching order ${req.params.id}:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al obtener orden',
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

/**
 * GET /api/printful/orders
 * Lista todas las órdenes
 */
app.get('/api/printful/orders', async (req, res) => {
  try {
    const { status, offset = 0, limit = 20 } = req.query;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('offset', offset);
    params.append('limit', limit);

    const response = await printfulApi.get(`/orders?${params.toString()}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching orders:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al obtener órdenes',
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

// ============================================
// RUTAS DE STRIPE
// ============================================

/**
 * POST /api/create-payment-intent
 * Crea un PaymentIntent de Stripe
 */
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'eur', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Se requiere un monto válido',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe usa centavos
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`PaymentIntent ${paymentIntent.id} created for ${amount / 100} ${currency.toUpperCase()}`);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    res.status(500).json({
      error: 'Error al crear el pago',
      details: error.message,
    });
  }
});

/**
 * POST /webhook/stripe
 * Webhook para eventos de Stripe
 */
app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar eventos de Stripe
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
      // Aquí podrías enviar un email de confirmación
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log(`PaymentIntent ${failedPayment.id} failed`);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// ============================================
// WEBHOOK DE PRINTFUL
// ============================================

/**
 * POST /webhook/printful
 * Webhook para eventos de Printful
 */
app.post('/webhook/printful', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log(`Printful webhook received: ${type}`);

    switch (type) {
      case 'package_shipped':
        console.log(`Order ${data.order.id} has been shipped`);
        console.log(`Tracking number: ${data.shipment.tracking_number}`);
        console.log(`Carrier: ${data.shipment.carrier}`);
        // Aquí podrías enviar un email con el tracking al cliente
        break;

      case 'order_created':
        console.log(`Order ${data.order.id} created in Printful`);
        break;

      case 'order_updated':
        console.log(`Order ${data.order.id} updated: ${data.order.status}`);
        break;

      case 'order_failed':
        console.log(`Order ${data.order.id} failed`);
        // Aquí podrías notificar al admin
        break;

      case 'order_canceled':
        console.log(`Order ${data.order.id} canceled`);
        break;

      default:
        console.log(`Unknown webhook type: ${type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing Printful webhook:', error.message);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
});

// ============================================
// RUTA DE HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      printful: !!process.env.PRINTFUL_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
    },
  });
});

// ============================================
// MANEJO DE ERRORES
// ============================================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Servidor iniciado en http://localhost:${PORT}           ║
║                                                            ║
║   Endpoints disponibles:                                   ║
║   - GET  /api/printful/products                           ║
║   - GET  /api/printful/products/:id                       ║
║   - POST /api/printful/shipping/rates                     ║
║   - POST /api/printful/orders                             ║
║   - GET  /api/printful/orders                             ║
║   - GET  /api/printful/orders/:id                         ║
║   - POST /api/create-payment-intent                       ║
║   - POST /webhook/stripe                                  ║
║   - POST /webhook/printful                                ║
║   - GET  /api/health                                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
