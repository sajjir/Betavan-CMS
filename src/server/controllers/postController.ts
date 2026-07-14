import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AuthenticatedRequest } from "../auth.js";

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

// Post CRUD
export async function getPosts(req: Request, res: Response) {
  try {
    const { categorySlug, tagSlug, status, page = "1", limit = "10" } = req.query;
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

    if (categorySlug) {
      where.category = { slug: String(categorySlug) };
    }

    if (tagSlug) {
      where.tags = { some: { slug: String(tagSlug) } };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          category: true,
          tags: true,
          author: {
            select: { id: true, name: true, email: true, role: true }
          },
          blocks: {
            orderBy: { order: "asc" }
          }
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limitNum
      }),
      prisma.post.count({ where })
    ]);

    // Parse the blocks' serialized JSON
    const postsWithParsedBlocks = posts.map(post => ({
      ...post,
      blocks: post.blocks.map(block => ({
        ...block,
        data: JSON.parse(block.data)
      }))
    }));

    return res.json({
      posts: postsWithParsedBlocks,
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
        category: true,
        tags: true,
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

    const postWithParsedBlocks = {
      ...post,
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
      categoryId,
      tagIds = [], // Array of tag IDs
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
        categoryId: categoryId || null,
        tags: {
          connect: tagIds.map((id: string) => ({ id }))
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
        category: true,
        tags: true,
        blocks: {
          orderBy: { order: "asc" }
        }
      }
    });

    const parsedPost = {
      ...finalPost,
      blocks: finalPost?.blocks.map(block => ({
        ...block,
        data: JSON.parse(block.data)
      }))
    };

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
      categoryId,
      tagIds,
      blocks
    } = req.body;

    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { tags: true }
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

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
    
    if (categoryId !== undefined) {
      updateData.categoryId = categoryId || null;
    }

    // Connect/Disconnect tags
    if (tagIds !== undefined) {
      updateData.tags = {
        disconnect: existingPost.tags.map(t => ({ id: t.id })),
        connect: tagIds.map((id: string) => ({ id }))
      };
    }

    // Update main post content
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData
    });

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
        category: true,
        tags: true,
        blocks: {
          orderBy: { order: "asc" }
        }
      }
    });

    const parsedPost = {
      ...finalPost,
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

// Category CRUD
export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, slug, parentId } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const catSlug = slug ? slugify(slug) : slugify(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug: catSlug,
        parentId: parentId || null
      }
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, slug, parentId } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slugify(slug);
    
    if (parentId !== undefined) {
      if (parentId) {
        // Prevent setting parent to itself
        if (parentId === id) {
          return res.status(400).json({ error: "A category cannot be its own parent" });
        }
        
        // Prevent circular reference (walking up parentId chain)
        let currParentId = parentId;
        while (currParentId) {
          if (currParentId === id) {
            return res.status(400).json({ error: "Circular reference detected" });
          }
          const parentCat = await prisma.category.findUnique({
            where: { id: currParentId },
            select: { parentId: true }
          });
          if (!parentCat) break;
          currParentId = parentCat.parentId;
        }
        
        updateData.parentId = parentId;
      } else {
        updateData.parentId = null;
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData
    });

    return res.json(updatedCategory);
  } catch (error) {
    console.error("Update category error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reassignTo } = req.body; // Can be a category id or null

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Reassign posts to reassignTo category or set to null (uncategorized)
    await prisma.post.updateMany({
      where: { categoryId: id },
      data: { categoryId: reassignTo || null }
    });

    // Cascade-promote children: set children's parentId to the deleted category's parentId
    await prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: existingCategory.parentId }
    });

    // Delete the category
    await prisma.category.delete({
      where: { id }
    });

    return res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Tag CRUD
export async function getTags(req: Request, res: Response) {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" }
    });
    return res.json(tags);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createTag(req: Request, res: Response) {
  try {
    const { name, slug } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    const tagSlug = slug ? slugify(slug) : slugify(name);

    const tag = await prisma.tag.create({
      data: {
        name,
        slug: tagSlug
      }
    });

    return res.status(201).json(tag);
  } catch (error) {
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
