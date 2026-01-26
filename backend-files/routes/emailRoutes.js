/**
 * Rutas de Email
 */

import express from "express";
import {
  sendBookingReceivedEmail,
  sendBookingConfirmedEmail,
  sendBookingRejectedEmail,
  sendBookingCancelledEmail
} from "../controllers/emailController.js";

const router = express.Router();

// POST /api/email/booking-received
router.post("/booking-received", sendBookingReceivedEmail);

// POST /api/email/booking-confirmed
router.post("/booking-confirmed", sendBookingConfirmedEmail);

// POST /api/email/booking-rejected
router.post("/booking-rejected", sendBookingRejectedEmail);

// POST /api/email/booking-cancelled
router.post("/booking-cancelled", sendBookingCancelledEmail);

export default router;
