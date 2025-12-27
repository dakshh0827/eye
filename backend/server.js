import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Prisma
import prisma from "./config/prisma.js";

// Routes
import imageRoutes from "./routes/images.js";
import errorHandler from "./middlewares/errorHandler.js";
 
// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --------------------
// Middleware
// --------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://eye-memories.vercel.app",
    credentials: true,
  })
);

app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------
// Prisma Connection Test
// --------------------
const testPrismaConnection = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected to database");
  } catch (error) {
    console.error("❌ Prisma connection error:", error);
    process.exit(1);
  }
};

await testPrismaConnection();

// --------------------
// Routes
// --------------------
app.use("/api/images", imageRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "OK",
      timestamp: new Date(),
      database: "connected",
      prisma: "ready",
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date(),
      database: "disconnected",
      error: error.message,
    });
  }
});

// --------------------
// Error Handler
// --------------------
app.use(errorHandler);

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || "development"}`);
});

// --------------------
// Graceful Shutdown
// --------------------
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(async () => {
    console.log("HTTP server closed");
    await prisma.$disconnect();
    console.log("Prisma disconnected");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
