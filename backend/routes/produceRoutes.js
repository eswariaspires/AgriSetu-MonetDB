
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProduce,
  createProduce,
  updateProduce,
  deleteProduce,
} from "../controllers/produceController.js";

const router = express.Router();

router.get("/", getProduce);
router.post("/", protect, createProduce);
router.patch("/:id", protect, updateProduce);
router.delete("/:id", protect, deleteProduce);

export default router;