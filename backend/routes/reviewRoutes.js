import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
createReview,
getFarmerReviews,
getProduceReviews,
getMyReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

// Public: reviews can be viewed without logging in.
router.get("/farmer/:farmerId", getFarmerReviews);
router.get("/produce/:produceId", getProduceReviews);

// Protected: review submission and buyer's own review history.
router.post("/", protect, createReview);
router.get("/mine", protect, getMyReviews);

export default router;
