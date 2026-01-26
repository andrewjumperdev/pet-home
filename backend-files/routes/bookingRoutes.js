/**
 * Rutas de Reservas
 * Gestión completa de bookings
 */

import express from "express";
import {
  confirmBooking,
  rejectBooking,
  cancelBooking,
  getBooking,
  getBookingsByEmail,
  getCancellationPolicy
} from "../controllers/bookingController.js";
import {
  verifyAdminApiKey,
  strictRateLimiter,
  sanitizeInputs
} from "../middleware/auth.js";

const router = express.Router();

// Middleware de seguridad para todas las rutas
router.use(sanitizeInputs);

// ========== RUTAS PÚBLICAS ==========

// GET /api/bookings/cancel-policy - Política de cancelación
router.get("/cancel-policy", getCancellationPolicy);

// GET /api/bookings/:id - Ver reserva (requiere email o token)
router.get("/:id", getBooking);

// GET /api/bookings/by-email/:email - Reservas del cliente
router.get("/by-email/:email", getBookingsByEmail);

// POST /api/bookings/cancel - Cancelar reserva (cliente)
router.post("/cancel", strictRateLimiter, cancelBooking);

// ========== RUTAS ADMIN ==========

// POST /api/bookings/confirm - Confirmar y cobrar (solo admin)
router.post("/confirm", verifyAdminApiKey, strictRateLimiter, confirmBooking);

// POST /api/bookings/reject - Rechazar reserva (solo admin)
router.post("/reject", verifyAdminApiKey, rejectBooking);

export default router;
