/**
 * Rutas de Printful
 * Endpoints para el e-commerce de merchandising
 */

import express from "express";
import {
  getProducts,
  getProductById,
  getShippingRates,
  createOrder,
  getOrderById,
  getOrders,
  handleWebhook,
} from "../controllers/printfulController.js";

const router = express.Router();

// ============================================
// PRODUCTOS
// ============================================

// GET /api/printful/products - Lista todos los productos
router.get("/products", getProducts);

// GET /api/printful/products/:id - Detalle de producto con variantes
router.get("/products/:id", getProductById);

// ============================================
// ENVÍO
// ============================================

// POST /api/printful/shipping/rates - Calcular tarifas de envío
router.post("/shipping/rates", getShippingRates);

// ============================================
// ÓRDENES
// ============================================

// GET /api/printful/orders - Lista órdenes
router.get("/orders", getOrders);

// GET /api/printful/orders/:id - Detalle de orden
router.get("/orders/:id", getOrderById);

// POST /api/printful/orders - Crear orden
router.post("/orders", createOrder);

// ============================================
// WEBHOOK
// ============================================

// POST /api/printful/webhook - Webhook de Printful
router.post("/webhook", handleWebhook);

export default router;
