/**
 * Controlador de Pagos para el Store (Merch)
 * Maneja los pagos de Stripe específicos para el e-commerce
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/store/create-payment-intent
 * Crea un PaymentIntent para compras del store
 */
export const createStorePaymentIntent = async (req, res) => {
  try {
    const {
      amount,
      currency = "eur",
      customer_email,
      customer_name,
      shipping_address,
      items
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Se requiere un monto válido" });
    }

    // Crear PaymentIntent con metadata del pedido
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe usa centavos
      currency,
      metadata: {
        type: "store_purchase",
        customer_email: String(customer_email || ""),
        customer_name: String(customer_name || ""),
        shipping_address: JSON.stringify(shipping_address || {}),
        items: JSON.stringify(items || []),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`✅ Store PaymentIntent ${paymentIntent.id} created for ${amount / 100} ${currency.toUpperCase()}`);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("❌ Stripe error:", error.message);
    res.status(500).json({
      error: "Error al crear el pago",
      details: error.message
    });
  }
};

/**
 * POST /api/store/webhook
 * Webhook de Stripe para eventos del store
 */
export const handleStoreWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_STORE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar eventos
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      if (paymentIntent.metadata?.type === "store_purchase") {
        console.log(`✅ Store payment ${paymentIntent.id} succeeded`);
        // Aquí se crea la orden en Printful automáticamente
        // (esto lo hace el frontend después del pago exitoso)
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      if (failedPayment.metadata?.type === "store_purchase") {
        console.log(`❌ Store payment ${failedPayment.id} failed`);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
