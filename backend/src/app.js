import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import propertyRoutes from "./routes/propertyRoutes.js";

dotenv.config();
await connectDB();


import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS (allow local dev, env-configured, and Vercel frontends)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  "https://real-estate-frontend-psi.vercel.app",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);
    // Exact match list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any *.vercel.app subdomain (use cautiously)
    const vercelMatch = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*vercel\.app$/i;
    if (vercelMatch.test(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
// Explicitly handle preflight without wildcard pattern (Express 5 safe)
const vercelRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*vercel\.app$/i;
function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (vercelRegex.test(origin)) return true;
  return false;
}

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin || "";
    if (isAllowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.status(204).end();
    }
    return res.status(403).json({ message: "Not allowed by CORS" });
  }
  next();
});
app.use(express.json());
app.use(morgan("dev"));

// Serve uploaded images statically (supports absolute or relative `UPLOAD_DIR`)
const projectRoot = path.join(__dirname, "..", "..");
const uploadDirEnv = process.env.UPLOAD_DIR || "uploads";
const uploadPath = path.isAbsolute(uploadDirEnv)
  ? uploadDirEnv
  : path.join(projectRoot, uploadDirEnv);
app.use("/uploads", express.static(uploadPath));

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use("/api/properties", propertyRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Health endpoint for frontend checks
app.get("/api/health", (req, res) => {
  const dbReadyStates = ["disconnected", "connected", "connecting", "disconnecting", "uninitialized"];
  const stateIndex = mongoose.connection.readyState;
  const dbState = dbReadyStates[stateIndex] || String(stateIndex);
  res.json({ ok: true, db: dbState });
});

export default app;
