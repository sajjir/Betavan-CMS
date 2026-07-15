import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AuthenticatedRequest } from "../auth.js";
import { fireWebhook } from "../lib/webhooks.js";

async function triggerPostPublishedWebhook(req: Request, post: any) {
  const protocol = req.protocol || "https";
  const host = req.get("host") || "betavan.ir";
  const url = `${protocol}://${host}/blog/${post.slug}`;
  
  // Fire and forget
  fireWebhook("post.published", {
    postId: post.id,
    title: post.title,
    slug: post.slug,
    url: url
  }).catch(err => console.error("Error triggering post.published webhook:", err));
}

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

// Helper to map term relations to flat objects
export function mapPostTerms(post: any) {
  if (!post) return null;
  const termsList = post.terms?.map((pt: any) => pt.term) || [];
  const category = termsList.find((t: any) => t.taxonomy?.key === "category") || null;
  const tags = termsList.filter((t: any) => t.taxonomy?.key === "tag");
  const contentType = termsList.find((t: any) => t.taxonomy?.key === "content_type") || null;
  const skillLevel = termsList.find((t: any) => t.taxonomy?.key === "skill_level") || null;

  return {
    ...post,
    category,
    tags,
    contentType,
    skillLevel,
    terms: termsList
  };
}

// Post CRUD
export async function getPosts(req: Request, res: Response) {
  try {
    const { categorySlug, tagSlug, taxonomyPrefix, termSlug, status, page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(String(page)) || 1;
    const limitNum = parseInt(String(limit)) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (status) {
      where.status = String(status);
    } else {
      // Public visitors only see published posts
      where.status = "PUBLISHED";
    }

    const andConditions: any[] = [];
    if (categorySlug) {
      andConditions.push({
        terms: {
          some: {
            term: {
              slug: String(categorySlug),
              taxonomy: { key: "category" }
            }
          }
        }
      });
    }

    if (tagSlug) {
      andConditions.push({
        terms: {
          some: {
            term: {
              slug: String(tagSlug),
              taxonomy: { key: "tag" }
            }
          }
        }
      });
    }

    if (taxonomyPrefix && termSlug) {
      andConditions.push({
        terms: {
          some: {
            term: {
              slug: String(termSlug),
              taxonomy: { urlPrefix: String(taxonomyPrefix) }
            }
          }
        }
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          terms: {
            include: {
              term: {
                include: {
                  taxonomy: true
                }
              }
            }
          },
          author: {
            select: { id: true, name: true, email: true, role: true }
          },
          blocks: {
            orderBy: { order: "asc" }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum
      }),
      prisma.post.count({ where })
    ]);

    // Parse blocks and map terms
    const mappedPosts = posts.map(post => {
      const mapped = mapPostTerms(post);
      return {
        ...mapped,
        blocks: post.blocks.map(block => ({
          ...block,
          data: JSON.parse(block.data)
        }))
      };
    });

    return res.json({
      posts: mappedPosts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error("Get posts error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPostBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        terms: {
          include: {
            term: {
              include: {
                taxonomy: true
              }
            }
          }
        },
        author: {
          select: { id: true, name: true, email: true, role: true }
        },
        blocks: {
          orderBy: { order: "asc" }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const mapped = mapPostTerms(post);
    const postWithParsedBlocks = {
      ...mapped,
      blocks: post.blocks.map(block => ({
        ...block,
        data: JSON.parse(block.data)
      }))
    };

    return res.json(postWithParsedBlocks);
  } catch (error: any) {
    console.error("Get post by slug error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createPost(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      title,
      slug,
      excerpt,
      status,
      coverImage,
      seoTitle,
      seoDescription,
      ogImage,
      termIds = [], // Explicit array of all selected term IDs
      categoryId,
      tagIds,
      contentTypeId,
      skillLevelId,
      blocks = [] // Array of block objects { type, data, order }
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const postSlug = slug ? slugify(slug) : slugify(title);

    // Ensure slug uniqueness
    const existingPost = await prisma.post.findUnique({
      where: { slug: postSlug }
    });

    if (existingPost) {
      return res.status(400).json({ error: `A post with slug "${postSlug}" already exists` });
    }

    const authorId = req.user?.id;
    if (!authorId) {
      return res.status(401).json({ error: "Unauthorized: Author ID missing" });
    }

    const publishedAt = status === "PUBLISHED" ? new Date() : null;

    // Consolidate term ids
    let consolidatedTermIds: string[] = [];
    if (Array.isArray(termIds) && termIds.length > 0) {
      consolidatedTermIds = [...termIds];
    } else {
      if (categoryId) consolidatedTermIds.push(categoryId);
      if (contentTypeId) consolidatedTermIds.push(contentTypeId);
      if (skillLevelId) consolidatedTermIds.push(skillLevelId);
      if (Array.isArray(tagIds)) consolidatedTermIds.push(...tagIds);
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug: postSlug,
        excerpt,
        status: status || "DRAFT",
        publishedAt,
        coverImage,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        ogImage: ogImage || coverImage,
        authorId,
        terms: {
          create: consolidatedTermIds.map(termId => ({
            term: { connect: { id: termId } }
          }))
        }
      }
    });

    // Create blocks in order
    if (blocks && blocks.length > 0) {
      await prisma.postBlock.createMany({
        data: blocks.map((b: any, index: number) => ({
          postId: post.id,
          type: b.type,
          order: b.order !== undefined ? b.order : index,
          data: JSON.stringify(b.data)
        }))
      });
    }

    // Fetch newly created post with details
    const finalPost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        terms: {
          include: {
            term: {
              include: {
                taxonomy: true
              }
            }
          }
        },
        blocks: {
          orderBy: { order: "asc" }
        }
      }
    });

    const mapped = mapPostTerms(finalPost);
    const parsedPost = {
      ...mapped,
      blocks: finalPost?.blocks.map(block => ({
        ...block,
        data: JSON.parse(block.data)
      }))
    };

    if (post.status === "PUBLISHED") {
      await triggerPostPublishedWebhook(req, post);
    }

    return res.status(201).json(parsedPost);
  } catch (error: any) {
    console.error("Create post error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updatePost(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      status,
      coverImage,
      seoTitle,
      seoDescription,
      ogImage,
      termIds,
      categoryId,
      tagIds,
      contentTypeId,
      skillLevelId,
      blocks
    } = req.body;

    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        terms: true
      }
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    const statusChangedToPublished = status === "PUBLISHED" && existingPost.status !== "PUBLISHED";

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slugify(slug);
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    
    if (status !== undefined) {
      updateData.status = status;
      if (status === "PUBLISHED" && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      } else if (status === "DRAFT") {
        updateData.publishedAt = null;
      }
    }
    
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (ogImage !== undefined) updateData.ogImage = ogImage;

    // Handle terms updates
    let shouldUpdateTerms = false;
    let consolidatedTermIds: string[] = [];

    if (termIds !== undefined) {
      shouldUpdateTerms = true;
      consolidatedTermIds = [...termIds];
    } else if (categoryId !== undefined || tagIds !== undefined || contentTypeId !== undefined || skillLevelId !== undefined) {
      shouldUpdateTerms = true;
      // Get existing ones to keep what is not modified
      const existingTermIds = existingPost.terms.map(t => t.termId);
      // We will need to query them to find their taxonomies if we want fine-grained merge, but simplest is to fetch all assigned term ids, find their taxonomy, and replace the modified ones.
      // However, the post editor UI will send the full list of consolidated `termIds` or specific ones.
      // Let's implement full rebuild from what's passed, and use existing for what's omitted:
      const existingTermsWithTax = await prisma.term.findMany({
        where: { id: { in: existingTermIds } },
        include: { taxonomy: true }
      });

      const oldCat = existingTermsWithTax.find(t => t.taxonomy.key === "category")?.id;
      const oldType = existingTermsWithTax.find(t => t.taxonomy.key === "content_type")?.id;
      const oldLevel = existingTermsWithTax.find(t => t.taxonomy.key === "skill_level")?.id;
      const oldTags = existingTermsWithTax.filter(t => t.taxonomy.key === "tag").map(t => t.id);

      const finalCat = categoryId !== undefined ? categoryId : oldCat;
      const finalType = contentTypeId !== undefined ? contentTypeId : oldType;
      const finalLevel = skillLevelId !== undefined ? skillLevelId : oldLevel;
      const finalTags = tagIds !== undefined ? tagIds : oldTags;

      if (finalCat) consolidatedTermIds.push(finalCat);
      if (finalType) consolidatedTermIds.push(finalType);
      if (finalLevel) consolidatedTermIds.push(finalLevel);
      if (Array.isArray(finalTags)) consolidatedTermIds.push(...finalTags);
    }

    if (shouldUpdateTerms) {
      // Clear all existing associations
      await prisma.postTerm.deleteMany({
        where: { postId: id }
      });

      updateData.terms = {
        create: consolidatedTermIds.map(termId => ({
          term: { connect: { id: termId } }
        }))
      };
    }

    // Update main post content
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData
    });

    if (statusChangedToPublished) {
      await triggerPostPublishedWebhook(req, updatedPost);
    }

    // Handle block updates: Delete existing blocks and recreate (simplest, most reliable approach)
    if (blocks !== undefined) {
      await prisma.postBlock.deleteMany({
        where: { postId: id }
      });

      if (blocks && blocks.length > 0) {
        await prisma.postBlock.createMany({
          data: blocks.map((b: any, index: number) => ({
            postId: id,
            type: b.type,
            order: b.order !== undefined ? b.order : index,
            data: JSON.stringify(b.data)
          }))
        });
      }
    }

    const finalPost = await prisma.post.findUnique({
      where: { id },
      include: {
        terms: {
          include: {
            term: {
              include: {
                taxonomy: true
              }
            }
          }
        },
        blocks: {
          orderBy: { order: "asc" }
        }
      }
    });

    const mapped = mapPostTerms(finalPost);
    const parsedPost = {
      ...mapped,
      blocks: finalPost?.blocks.map(block => ({
        ...block,
        data: JSON.parse(block.data)
      }))
    };

    return res.json(parsedPost);
  } catch (error: any) {
    console.error("Update post error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deletePost(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const existingPost = await prisma.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Delete post terms relations first (foreign key constraint)
    await prisma.postTerm.deleteMany({
      where: { postId: id }
    });

    // Delete post blocks first (foreign key constraint)
    await prisma.postBlock.deleteMany({
      where: { postId: id }
    });

    await prisma.post.delete({
      where: { id }
    });

    return res.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("Delete post error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Download Counter and Action
export async function handleDownload(req: Request, res: Response) {
  try {
    const { blockId } = req.params;

    const block = await prisma.postBlock.findUnique({
      where: { id: blockId }
    });

    if (!block || block.type !== "DOWNLOAD_BOX") {
      return res.status(404).json({ error: "Download block not found" });
    }

    const blockData = JSON.parse(block.data);
    const downloads = (blockData.downloads || 0) + 1;
    const updatedData = { ...blockData, downloads };

    // Update the block counter
    await prisma.postBlock.update({
      where: { id: blockId },
      data: {
        data: JSON.stringify(updatedData)
      }
    });

    // Direct the user to download the file url
    if (blockData.link) {
      return res.redirect(blockData.link);
    } else {
      return res.status(400).json({ error: "Download link is not configured for this block" });
    }
  } catch (error: any) {
    console.error("Download counter increment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
