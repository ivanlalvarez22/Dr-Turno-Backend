import express from "express";
import {
  getAllNotifications,
  markNotificationAsRead,
} from "../Controllers/notificationController.js";
import { authenticate } from "./../auth/verifyToken.js";

const router = express.Router({ mergeParams: true });

router.route("/").get(authenticate, getAllNotifications);
router.put(
  "/:notificationId/mark-as-read",
  authenticate,
  markNotificationAsRead
);

export default router;
