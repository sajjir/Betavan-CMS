import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = 3000;

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Standard Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Serve static uploaded files
app.use("/uploads", express.static(UPLOADS_DIR));

// Import seed & DB setup
import { seedDatabase } from "./src/server/seed.js";
import { authenticate, requireRole } from "./src/server/auth.js";

// Controllers
import * as authController from "./src/server/controllers/authController.js";
import * as postController from "./src/server/controllers/postController.js";
import * as mediaController from "./src/server/controllers/mediaController.js";
import * as pageController from "./src/server/controllers/pageController.js";
import * as seoController from "./src/server/controllers/seoController.js";

// --- API ROUTES ---

// SEO Endpoints
app.get("/sitemap.xml", seoController.getSitemap);
app.get("/robots.txt", seoController.getRobotsTxt);

// Authentication Module
app.post("/api/auth/login", authController.login);
app.post("/api/auth/refresh", authController.refresh);
app.post("/api/auth/logout", authController.logout);
app.get("/api/auth/me", authenticate, authController.me);

// Categories Module
app.get("/api/categories", postController.getCategories);
app.post("/api/categories", authenticate, requireRole(["ADMIN", "EDITOR"]), postController.createCategory);

// Tags Module
app.get("/api/tags", postController.getTags);
app.post("/api/tags", authenticate, requireRole(["ADMIN", "EDITOR"]), postController.createTag);

// Posts Module
app.get("/api/posts", postController.getPosts);
app.get("/api/posts/:slug", postController.getPostBySlug);
app.post("/api/posts", authenticate, requireRole(["ADMIN", "EDITOR"]), postController.createPost);
app.put("/api/posts/:id", authenticate, requireRole(["ADMIN", "EDITOR"]), postController.updatePost);
app.delete("/api/posts/:id", authenticate, requireRole(["ADMIN", "EDITOR"]), postController.deletePost);

// Downloads (Public, increments download box stats & redirects/triggers)
app.get("/downloads/:blockId", postController.handleDownload);

// Pages Module (Static pages)
app.get("/api/pages/:slug", pageController.getPageBySlug);
app.post("/api/pages", authenticate, requireRole(["ADMIN", "EDITOR"]), pageController.upsertPage);

// Media Module
app.get("/api/media", authenticate, requireRole(["ADMIN", "EDITOR"]), mediaController.getMedia);
app.post(
  "/api/media/upload",
  authenticate,
  requireRole(["ADMIN", "EDITOR"]),
  upload.single("file"),
  mediaController.uploadMedia
);

// --- VITE DEV / PRODUCTION HANDLER ---
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode: Use Vite dev server middleware
    console.log("Starting server in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: Serve built client assets statically
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to port 3000 and 0.0.0.0 as required by host proxy
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running and listening on http://0.0.0.0:${PORT}`);
  });
}

// Run database seed & start server
seedDatabase()
  .then(() => setupViteOrStatic())
  .catch((err) => {
    console.error("Database seed or start-up failed:", err);
  });
