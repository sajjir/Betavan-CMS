import { Request, Response } from "express";
import { prisma } from "../db.js";

export async function getPages(req: Request, res: Response) {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" }
    });
    const parsedPages = pages.map(p => ({
      ...p,
      blocks: JSON.parse(p.blocks)
    }));
    return res.json(parsedPages);
  } catch (error) {
    console.error("Get pages error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPageBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const page = await prisma.page.findUnique({
      where: { slug }
    });

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    return res.json({
      ...page,
      blocks: JSON.parse(page.blocks)
    });
  } catch (error) {
    console.error("Get page by slug error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function upsertPage(req: Request, res: Response) {
  try {
    const { title, slug, seoTitle, seoDescription, blocks = [] } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    const page = await prisma.page.upsert({
      where: { slug },
      create: {
        title,
        slug,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || "",
        blocks: JSON.stringify(blocks)
      },
      update: {
        title,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || "",
        blocks: JSON.stringify(blocks)
      }
    });

    return res.json({
      ...page,
      blocks: JSON.parse(page.blocks)
    });
  } catch (error) {
    console.error("Upsert page error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deletePage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const page = await prisma.page.findUnique({
      where: { id }
    });

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    await prisma.page.delete({
      where: { id }
    });

    return res.json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Delete page error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
