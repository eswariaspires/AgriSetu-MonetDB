
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyNotifications,
  markNotificationRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(protect);

router.get("/mine", getMyNotifications);
router.patch("/:id/read", markNotificationRead);

export default router;
