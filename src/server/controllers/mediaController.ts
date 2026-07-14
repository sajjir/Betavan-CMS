import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { prisma } from "../db.js";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function uploadMedia(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { folder, tags, altText } = req.body;
    const originalPath = req.file.path;
    const originalExt = path.extname(req.file.originalname).toLowerCase();
    
    let filename = req.file.filename;
    let finalPath = originalPath;
    let mimeType = req.file.mimetype;

    const isImage = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType);

    if (isImage && mimeType !== "image/webp") {
      // Convert to WebP using sharp
      const webpFilename = `${path.basename(filename, originalExt)}.webp`;
      const webpPath = path.join(UPLOADS_DIR, webpFilename);

      try {
        await sharp(originalPath)
          .webp({ quality: 80 })
          .toFile(webpPath);
        
        // Remove original non-webp file
        fs.unlinkSync(originalPath);
        
        filename = webpFilename;
        finalPath = webpPath;
        mimeType = "image/webp";
      } catch (sharpError) {
        console.error("Sharp conversion error, falling back to original:", sharpError);
      }
    }

    // Relative public URL
    const url = `/uploads/${filename}`;

    const media = await prisma.media.create({
      data: {
        filename,
        url,
        folder: folder || "general",
        tags: tags || "", // Stored as a comma-separated string
        altText: altText || ""
      }
    });

    return res.status(201).json({
      ...media,
      tags: media.tags ? media.tags.split(",").map(t => t.trim()) : []
    });
  } catch (error: any) {
    console.error("Media upload error:", error);
    return res.status(500).json({ error: "Internal server error during media upload" });
  }
}

export async function getMedia(req: Request, res: Response) {
  try {
    const { folder, tag } = req.query;

    const where: any = {};
    if (folder) {
      where.folder = String(folder);
    }

    const allMedia = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    // Client-side mapping for tag filtering in SQLite
    let filteredMedia = allMedia.map(m => ({
      ...m,
      tags: m.tags ? m.tags.split(",").map(t => t.trim()) : []
    }));

    if (tag) {
      const searchTag = String(tag).toLowerCase().trim();
      filteredMedia = filteredMedia.filter(m => 
        m.tags.some(t => t.toLowerCase() === searchTag)
      );
    }

    return res.json(filteredMedia);
  } catch (error: any) {
    console.error("Get media error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
