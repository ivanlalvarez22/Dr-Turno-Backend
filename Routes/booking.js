import express from "express";
import { authenticate, restrict } from "./../auth/verifyToken.js";
import {
  bookAppointment,
  updateBookingStatus,
  getCheckoutSession,
} from "../Controllers/bookingController.js";

const router = express.Router();

router.post("/book-directly/:doctorId", authenticate, bookAppointment);
router.put(
  "/:bookingId",
  authenticate,
  restrict(["doctor", "patient"]),
  updateBookingStatus
);
router.post("/checkout-session", getCheckoutSession);

export default router;
