import { prisma } from "./src/server/db.js";

async function runMigration() {
  console.log("Starting Category/Tag to Term Migration...");
  
  try {
    // 1. Ensure Taxonomies exist
    let catTax = await prisma.taxonomy.findUnique({ where: { key: "category" } });
    if (!catTax) {
      catTax = await prisma.taxonomy.create({
        data: {
          key: "category",
          name: "Category",
          nameFa: "دسته‌بندی",
          hierarchical: true,
          urlPrefix: "category"
        }
      });
      console.log("Created Category taxonomy.");
    }

    let tagTax = await prisma.taxonomy.findUnique({ where: { key: "tag" } });
    if (!tagTax) {
      tagTax = await prisma.taxonomy.create({
        data: {
          key: "tag",
          name: "Tag",
          nameFa: "برچسب",
          hierarchical: false,
          urlPrefix: "tag"
        }
      });
      console.log("Created Tag taxonomy.");
    }

    // 2. Fetch legacy categories if Table exists
    let legacyCategories: any[] = [];
    try {
      legacyCategories = await prisma.$queryRawUnsafe(`SELECT * FROM Category;`);
      console.log(`Found ${legacyCategories.length} legacy categories in DB.`);
    } catch (e: any) {
      console.log("Legacy Category table does not exist or has been dropped already. Skipping legacy categories.");
    }

    // 3. Fetch legacy tags if Table exists
    let legacyTags: any[] = [];
    try {
      legacyTags = await prisma.$queryRawUnsafe(`SELECT * FROM Tag;`);
      console.log(`Found ${legacyTags.length} legacy tags in DB.`);
    } catch (e: any) {
      console.log("Legacy Tag table does not exist or has been dropped already. Skipping legacy tags.");
    }

    // Map oldCategoryIds to newTermIds (preserving IDs where possible)
    const categoryIdMap = new Map<string, string>();
    for (const cat of legacyCategories) {
      // Create Term
      const existingTerm = await prisma.term.findFirst({
        where: { taxonomyId: catTax.id, slug: cat.slug }
      });

      if (!existingTerm) {
        const term = await prisma.term.create({
          data: {
            id: cat.id, // preserve exact ID if possible
            taxonomyId: catTax.id,
            name: cat.name,
            nameFa: cat.nameFa || cat.name,
            slug: cat.slug,
            description: cat.description || null
          }
        });
        categoryIdMap.set(cat.id, term.id);
        console.log(`Migrated legacy category "${cat.name}" -> Term ID: ${term.id}`);
      } else {
        categoryIdMap.set(cat.id, existingTerm.id);
        console.log(`Legacy category "${cat.name}" already exists as Term ID: ${existingTerm.id}`);
      }
    }

    // Map oldTagIds to newTermIds
    const tagIdMap = new Map<string, string>();
    for (const tag of legacyTags) {
      const existingTerm = await prisma.term.findFirst({
        where: { taxonomyId: tagTax.id, slug: tag.slug }
      });

      if (!existingTerm) {
        const term = await prisma.term.create({
          data: {
            id: tag.id, // preserve exact ID
            taxonomyId: tagTax.id,
            name: tag.name,
            nameFa: tag.nameFa || tag.name,
            slug: tag.slug
          }
        });
        tagIdMap.set(tag.id, term.id);
        console.log(`Migrated legacy tag "${tag.name}" -> Term ID: ${term.id}`);
      } else {
        tagIdMap.set(tag.id, existingTerm.id);
        console.log(`Legacy tag "${tag.name}" already exists as Term ID: ${existingTerm.id}`);
      }
    }

    // 4. Update Product Category connections
    if (categoryIdMap.size > 0) {
      const products = await prisma.product.findMany({
        where: { categoryId: { not: null } }
      });

      for (const prod of products) {
        if (prod.categoryId && categoryIdMap.has(prod.categoryId)) {
          const newId = categoryIdMap.get(prod.categoryId)!;
          await prisma.product.update({
            where: { id: prod.id },
            data: { categoryId: newId }
          });
          console.log(`Updated product "${prod.title}" categoryId: ${prod.categoryId} -> ${newId}`);
        }
      }
    }

    // 5. Query legacy Post to Category/Tag relationships from sqlite
    let legacyPostCategories: any[] = [];
    try {
      legacyPostCategories = await prisma.$queryRawUnsafe(`SELECT id, categoryId FROM Post WHERE categoryId IS NOT NULL;`);
    } catch (e) {
      // categoryId column might already be gone
    }

    for (const pc of legacyPostCategories) {
      const newTermId = categoryIdMap.get(pc.categoryId);
      if (newTermId) {
        const existingRelation = await prisma.postTerm.findUnique({
          where: { postId_termId: { postId: pc.id, termId: newTermId } }
        });
        if (!existingRelation) {
          await prisma.postTerm.create({
            data: { postId: pc.id, termId: newTermId }
          });
          console.log(`Linked Post ID ${pc.id} to migrated Category Term ID ${newTermId}`);
        }
      }
    }

    // Legacy many-to-many tag relationships (usually in a junction table like _PostToTag or similar in Prisma)
    let legacyPostTags: any[] = [];
    try {
      legacyPostTags = await prisma.$queryRawUnsafe(`SELECT A as postId, B as tagId FROM _PostToTag;`);
    } catch (e) {
      // table _PostToTag doesn't exist or is dropped
    }

    for (const pt of legacyPostTags) {
      const newTermId = tagIdMap.get(pt.tagId);
      if (newTermId) {
        const existingRelation = await prisma.postTerm.findUnique({
          where: { postId_termId: { postId: pt.postId, termId: newTermId } }
        });
        if (!existingRelation) {
          await prisma.postTerm.create({
            data: { postId: pt.postId, termId: newTermId }
          });
          console.log(`Linked Post ID ${pt.postId} to migrated Tag Term ID ${newTermId}`);
        }
      }
    }

    // Print final Term / PostTerm counts
    const termCount = await prisma.term.count();
    const postTermCount = await prisma.postTerm.count();
    console.log(`Migration Complete!`);
    console.log(`Total Term rows: ${termCount}`);
    console.log(`Total PostTerm rows: ${postTermCount}`);

  } catch (err: any) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

runMigration();
