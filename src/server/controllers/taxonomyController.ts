import { Request, Response } from "express";
import { prisma } from "../db.js";
import { generateTermDescription } from "../lib/ai.js";

// Helper to slugify strings
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * GET /api/taxonomies
 * Returns all taxonomies with their terms included.
 */
export async function getTaxonomies(req: Request, res: Response) {
  try {
    const taxonomies = await prisma.taxonomy.findMany({
      include: {
        terms: {
          orderBy: { name: "asc" }
        }
      }
    });
    return res.json(taxonomies);
  } catch (error: any) {
    console.error("Get taxonomies error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/terms
 * Returns terms, optionally filtered by taxonomy key via query param.
 */
export async function getTerms(req: Request, res: Response) {
  try {
    const { taxonomy } = req.query;
    const where: any = {};
    if (taxonomy) {
      where.taxonomy = { key: String(taxonomy) };
    }
    const terms = await prisma.term.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        taxonomy: true
      }
    });
    return res.json(terms);
  } catch (error: any) {
    console.error("Get terms error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/terms
 * Body: { taxonomyId, name, nameFa, slug, description, seoTitle, seoDescription, parentId }
 */
export async function createTerm(req: Request, res: Response) {
  try {
    const { taxonomyId, name, nameFa, slug, description, seoTitle, seoDescription, parentId } = req.body;
    if (!taxonomyId || !name) {
      return res.status(400).json({ error: "Taxonomy ID and Name are required" });
    }

    const termSlug = slug ? slugify(slug) : slugify(name);

    // Ensure uniqueness for [taxonomyId, slug]
    const existing = await prisma.term.findUnique({
      where: {
        taxonomyId_slug: {
          taxonomyId,
          slug: termSlug
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: `A term with slug "${termSlug}" already exists in this taxonomy.` });
    }

    const term = await prisma.term.create({
      data: {
        taxonomyId,
        name,
        nameFa: nameFa || null,
        slug: termSlug,
        description: description || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        parentId: parentId || null
      },
      include: {
        taxonomy: true
      }
    });

    return res.status(201).json(term);
  } catch (error: any) {
    console.error("Create term error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /api/terms/:id
 * Body: { name, nameFa, slug, description, seoTitle, seoDescription, parentId }
 */
export async function updateTerm(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, nameFa, slug, description, seoTitle, seoDescription, parentId } = req.body;

    const existing = await prisma.term.findUnique({
      where: { id },
      include: { taxonomy: true }
    });

    if (!existing) {
      return res.status(404).json({ error: "Term not found" });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (nameFa !== undefined) updateData.nameFa = nameFa || null;
    if (slug !== undefined) updateData.slug = slugify(slug);
    if (description !== undefined) updateData.description = description || null;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle || null;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription || null;

    if (parentId !== undefined) {
      if (parentId) {
        if (parentId === id) {
          return res.status(400).json({ error: "A term cannot be its own parent" });
        }

        // Circular reference check
        let currParentId = parentId;
        while (currParentId) {
          if (currParentId === id) {
            return res.status(400).json({ error: "Circular reference detected in hierarchy" });
          }
          const parentTerm = await prisma.term.findUnique({
            where: { id: currParentId },
            select: { parentId: true }
          });
          if (!parentTerm) break;
          currParentId = parentTerm.parentId;
        }

        updateData.parentId = parentId;
      } else {
        updateData.parentId = null;
      }
    }

    const updated = await prisma.term.update({
      where: { id },
      data: updateData,
      include: {
        taxonomy: true
      }
    });

    return res.json(updated);
  } catch (error: any) {
    console.error("Update term error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/terms/:id
 * Body: { reassignTo }
 */
export async function deleteTerm(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reassignTo } = req.body;

    const existing = await prisma.term.findUnique({
      where: { id },
      include: { taxonomy: true }
    });

    if (!existing) {
      return res.status(404).json({ error: "Term not found" });
    }

    // 1. Reassign or disconnect from posts (PostTerm)
    const postTerms = await prisma.postTerm.findMany({
      where: { termId: id }
    });

    for (const pt of postTerms) {
      if (reassignTo) {
        // Check if already assigned to reassignTo to avoid composite key constraint violation
        const targetExisting = await prisma.postTerm.findUnique({
          where: {
            postId_termId: {
              postId: pt.postId,
              termId: reassignTo
            }
          }
        });

        if (targetExisting) {
          // Just delete the old relation
          await prisma.postTerm.delete({
            where: {
              postId_termId: {
                postId: pt.postId,
                termId: id
              }
            }
          });
        } else {
          // Update termId
          await prisma.postTerm.update({
            where: {
              postId_termId: {
                postId: pt.postId,
                termId: id
              }
            },
            data: {
              termId: reassignTo
            }
          });
        }
      } else {
        // Just delete relation
        await prisma.postTerm.delete({
          where: {
            postId_termId: {
              postId: pt.postId,
              termId: id
            }
          }
        });
      }
    }

    // 2. Reassign Products categoryId if it's "category" taxonomy
    if (existing.taxonomy.key === "category") {
      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: reassignTo || null }
      });
    }

    // 3. Cascade promote children
    await prisma.term.updateMany({
      where: { parentId: id },
      data: { parentId: existing.parentId }
    });

    // 4. Finally delete the term
    await prisma.term.delete({
      where: { id }
    });

    return res.json({ message: "Term deleted successfully" });
  } catch (error: any) {
    console.error("Delete term error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/terms/generate-description
 * Body: { termName, taxonomyName }
 */
export async function generateDesc(req: Request, res: Response) {
  try {
    const { termName, taxonomyName } = req.body;
    if (!termName || !taxonomyName) {
      return res.status(400).json({ error: "termName and taxonomyName are required" });
    }

    const description = await generateTermDescription(termName, taxonomyName);
    return res.json({ description });
  } catch (error: any) {
    console.error("Generate term description error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate description with Gemini." });
  }
}

/**
 * GET /api/categories (Backward Compatibility)
 */
export async function getCategoriesCompat(req: Request, res: Response) {
  try {
    const categoryTax = await prisma.taxonomy.findUnique({ where: { key: "category" } });
    if (!categoryTax) return res.json([]);
    const terms = await prisma.term.findMany({
      where: { taxonomyId: categoryTax.id },
      orderBy: { name: "asc" }
    });
    return res.json(terms);
  } catch (error) {
    console.error("getCategoriesCompat error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/tags (Backward Compatibility)
 */
export async function getTagsCompat(req: Request, res: Response) {
  try {
    const tagTax = await prisma.taxonomy.findUnique({ where: { key: "tag" } });
    if (!tagTax) return res.json([]);
    const terms = await prisma.term.findMany({
      where: { taxonomyId: tagTax.id },
      orderBy: { name: "asc" }
    });
    return res.json(terms);
  } catch (error) {
    console.error("getTagsCompat error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
