
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { getConnection } from "./config/monetdb.js";

import authRoutes from "./routes/authRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import produceRoutes from "./routes/produceRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "8mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/produce", produceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "AgriSetu Backend is running with MonetDB",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await getConnection();

    console.log("MonetDB connected successfully");

    app.listen(PORT, () => {
      console.log(`AgriSetu backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MonetDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
