
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createConnection,
  getMyConnections,
  updateConnectionStatus,
} from "../controllers/connectionController.js";

const router = express.Router();

router.use(protect);

router.post("/", createConnection);
router.get("/mine", getMyConnections);
router.patch("/:id/status", updateConnectionStatus);

export default router;

