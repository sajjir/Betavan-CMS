import { Request, Response } from "express";
import { prisma } from "../db.js";

// Helper to slugify strings
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\u0600-\u06FF-]+/g, "") // Keep alphanumeric, Persian characters, and hyphens
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

// Get all products (public gets only published, admin can see all)
export async function getProducts(req: Request, res: Response) {
  try {
    const { categorySlug, status } = req.query;
    
    const where: any = {};
    
    // Status filter
    if (status) {
      where.status = String(status);
    } else {
      // By default, public storefront only gets published products
      where.status = "published";
    }

    // Category filter
    if (categorySlug) {
      where.category = { slug: String(categorySlug) };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json(products);
  } catch (error: any) {
    console.error("Get products error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get product by slug
export async function getProductBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(product);
  } catch (error: any) {
    console.error("Get product by slug error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Create product (Admin / Editor)
export async function createProduct(req: Request, res: Response) {
  try {
    const { title, slug, price, description, coverImage, status, categoryId } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ error: "Title and price are required" });
    }

    // Auto-generate slug if not provided
    let finalSlug = slug ? slugify(slug) : slugify(title);
    
    // Ensure slug is unique
    const existingProduct = await prisma.product.findUnique({
      where: { slug: finalSlug }
    });

    if (existingProduct) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        title,
        slug: finalSlug,
        price: Number(price),
        description: description || null,
        coverImage: coverImage || null,
        status: status || "draft",
        categoryId: categoryId || null
      }
    });

    return res.status(201).json(product);
  } catch (error: any) {
    console.error("Create product error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Update product (Admin / Editor)
export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, slug, price, description, coverImage, status, categoryId } = req.body;

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    let finalSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      finalSlug = slugify(slug);
      
      // Check slug collision
      const collision = await prisma.product.findUnique({
        where: { slug: finalSlug }
      });
      if (collision && collision.id !== id) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    } else if (title && !slug && title !== existing.title) {
      finalSlug = slugify(title);
      // Check collision
      const collision = await prisma.product.findUnique({
        where: { slug: finalSlug }
      });
      if (collision && collision.id !== id) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        slug: finalSlug,
        price: price !== undefined ? Number(price) : existing.price,
        description: description !== undefined ? description : existing.description,
        coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
        status: status !== undefined ? status : existing.status,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId
      }
    });

    return res.json(updated);
  } catch (error: any) {
    console.error("Update product error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Delete product (Admin / Editor)
export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    await prisma.product.delete({
      where: { id }
    });

    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
