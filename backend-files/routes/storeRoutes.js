/**
 * Rutas del Store (E-commerce)
 * Endpoints para pagos del merchandising
 */

import express from "express";
import {
  createStorePaymentIntent,
  handleStoreWebhook,
} from "../controllers/storePaymentController.js";

const router = express.Router();

// POST /api/store/create-payment-intent - Crear pago para el store
router.post("/create-payment-intent", createStorePaymentIntent);

// POST /api/store/webhook - Webhook de Stripe para el store
// Nota: Este endpoint necesita raw body, configurar en server.js
router.post("/webhook", express.raw({ type: "application/json" }), handleStoreWebhook);

export default router;
