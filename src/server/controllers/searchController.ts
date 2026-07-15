import { Request, Response } from "express";
import { prisma } from "../db.js";

export async function search(req: Request, res: Response) {
  try {
    const query = (req.query.q as string || "").trim();
    if (!query) {
      return res.json([]);
    }

    // Search published posts
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { excerpt: { contains: query } }
        ]
      },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true
      }
    });

    // Search published products
    const products = await prisma.product.findMany({
      where: {
        status: "published",
        OR: [
          { title: { contains: query } },
          { description: { contains: query } }
        ]
      },
      select: {
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        price: true
      }
    });

    // Combine results
    const combined = [
      ...posts.map(p => ({
        type: "post" as const,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || "",
        coverImage: p.coverImage || null,
        date: p.publishedAt,
        price: null
      })),
      ...products.map(p => ({
        type: "product" as const,
        title: p.title,
        slug: p.slug,
        excerpt: p.description || "",
        coverImage: p.coverImage || null,
        date: null,
        price: p.price
      }))
    ];

    // Compute simple relevance scoring
    const lowerQ = query.toLowerCase();
    const scored = combined.map(item => {
      const titleLower = item.title.toLowerCase();
      const excerptLower = item.excerpt.toLowerCase();
      let score = 0;

      if (titleLower === lowerQ) {
        score += 100;
      } else if (titleLower.startsWith(lowerQ)) {
        score += 50;
      } else if (titleLower.includes(lowerQ)) {
        score += 25;
      }

      if (excerptLower.includes(lowerQ)) {
        score += 10;
      }

      return { ...item, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Remove score property before sending to client
    const results = scored.map(({ score, ...rest }) => rest);

    return res.json(results);
  } catch (error: any) {
    console.error("Search API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
