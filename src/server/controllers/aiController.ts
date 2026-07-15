import { Request, Response } from "express";
import { AuthenticatedRequest } from "../auth.js";
import { 
  generatePostDraft, 
  generateProductDescription, 
  generateAltText, 
  generateSeoMeta 
} from "../lib/ai.js";

/**
 * POST /api/ai/draft-post
 * Body: { topic: string }
 */
export async function draftPost(req: AuthenticatedRequest, res: Response) {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ error: "Topic is required and must be a valid string." });
    }

    const draft = await generatePostDraft(topic);
    return res.json(draft);
  } catch (error: any) {
    console.error("AI Draft Post controller error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate post draft with Gemini." });
  }
}

/**
 * POST /api/ai/product-description
 * Body: { title: string }
 */
export async function productDescription(req: AuthenticatedRequest, res: Response) {
  try {
    const { title } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Product title is required and must be a valid string." });
    }

    const description = await generateProductDescription(title);
    return res.json({ description });
  } catch (error: any) {
    console.error("AI Product Description controller error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate product description with Gemini." });
  }
}

/**
 * POST /api/ai/alt-text
 * Body: { imageUrl: string }
 */
export async function altText(req: AuthenticatedRequest, res: Response) {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return res.status(400).json({ error: "Image URL or path is required." });
    }

    const alt = await generateAltText(imageUrl);
    return res.json({ altText: alt });
  } catch (error: any) {
    console.error("AI Alt Text controller error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate alt text with Gemini." });
  }
}

/**
 * POST /api/ai/seo-meta
 * Body: { title: string, content: string }
 */
export async function seoMeta(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, content } = req.body;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required and must be a string." });
    }

    const bodyContent = content || "";
    const seo = await generateSeoMeta(title, bodyContent);
    return res.json(seo);
  } catch (error: any) {
    console.error("AI SEO Meta controller error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate SEO Meta with Gemini." });
  }
}
