/**
 * Rutas de Capacidad
 * Validación de disponibilidad en tiempo real
 */

import express from "express";
import {
  checkCapacity,
  getCapacityCalendar,
  reserveCapacity,
  releaseCapacity
} from "../controllers/capacityController.js";

const router = express.Router();

// GET /api/capacity/check?startDate=2024-01-15&endDate=2024-01-17&quantity=2
router.get("/check", checkCapacity);

// GET /api/capacity/calendar?month=1&year=2024
router.get("/calendar", getCapacityCalendar);

// POST /api/capacity/reserve - Reservar temporalmente (checkout)
router.post("/reserve", reserveCapacity);

// DELETE /api/capacity/reserve/:reservationId - Liberar reserva
router.delete("/reserve/:reservationId", releaseCapacity);

export default router;
