import { prisma } from "./db.js";
import { hashPassword } from "./hash.js";

export async function seedDatabase() {
  console.log("Checking if database needs seeding...");
  
  // 1. Seed admin user if none exists
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log("No users found. Seeding default admin users...");
    
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "betavan.co@gmail.com";
    const adminName = process.env.SEED_ADMIN_NAME || "Betavan Admin";
    let adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!adminPassword) {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
      adminPassword = "";
      for (let i = 0; i < 12; i++) {
        adminPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      console.log("=====================================================================");
      console.log(`Generated admin password (save this, it will not be shown again): ${adminPassword}`);
      console.log("=====================================================================");
    }

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash: hashPassword(adminPassword),
        role: "ADMIN"
      }
    });
  }

  // 2. Seed Taxonomies
  const taxonomiesToSeed = [
    { key: "category", name: "Category", nameFa: "دسته‌بندی", hierarchical: true, urlPrefix: "category" },
    { key: "tag", name: "Tag", nameFa: "برچسب", hierarchical: false, urlPrefix: "tag" },
    { key: "content_type", name: "Content Type", nameFa: "نوع محتوا", hierarchical: false, urlPrefix: "type" },
    { key: "skill_level", name: "Skill Level", nameFa: "سطح مهارت", hierarchical: false, urlPrefix: "level" }
  ];

  for (const tax of taxonomiesToSeed) {
    const existing = await prisma.taxonomy.findUnique({ where: { key: tax.key } });
    if (!existing) {
      console.log(`Seeding taxonomy: ${tax.key}`);
      await prisma.taxonomy.create({ data: tax });
    }
  }

  // Retrieve all taxonomies to map key -> id
  const taxonomies = await prisma.taxonomy.findMany();
  const taxMap = new Map(taxonomies.map(t => [t.key, t.id]));

  // 3. Seed Terms for "category"
  const catTaxId = taxMap.get("category")!;
  const defaultCategories = [
    { name: "AI & Technology", nameFa: "هوش مصنوعی و فناوری", slug: "ai-technology" },
    { name: "Business & Entrepreneurship", nameFa: "کسب و کار و کارآفرینی", slug: "business-entrepreneurship" },
    { name: "Marketing", nameFa: "بازاریابی", slug: "marketing" }
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.term.findUnique({
      where: { taxonomyId_slug: { taxonomyId: catTaxId, slug: cat.slug } }
    });
    if (!existing) {
      await prisma.term.create({
        data: {
          taxonomyId: catTaxId,
          name: cat.name,
          nameFa: cat.nameFa,
          slug: cat.slug,
          description: `All about ${cat.name}.`
        }
      });
    }
  }

  // 4. Seed Terms for "tag"
  const tagTaxId = taxMap.get("tag")!;
  const defaultTags = [
    { name: "Artificial Intelligence", nameFa: "هوش مصنوعی", slug: "ai" },
    { name: "SaaS", nameFa: "نرم‌افزار به عنوان خدمت", slug: "saas" },
    { name: "Startup", nameFa: "استارت‌آپ", slug: "startup" },
    { name: "Video Tutorials", nameFa: "آموزش‌های ویدئویی", slug: "tutorials" }
  ];

  for (const t of defaultTags) {
    const existing = await prisma.term.findUnique({
      where: { taxonomyId_slug: { taxonomyId: tagTaxId, slug: t.slug } }
    });
    if (!existing) {
      await prisma.term.create({
        data: {
          taxonomyId: tagTaxId,
          name: t.name,
          nameFa: t.nameFa,
          slug: t.slug
        }
      });
    }
  }

  // 5. Seed Terms for "content_type"
  const typeTaxId = taxMap.get("content_type")!;
  const defaultTypes = [
    { name: "Tutorial", nameFa: "آموزش", slug: "tutorial" },
    { name: "Case Study", nameFa: "مطالعه موردی", slug: "case-study" },
    { name: "News", nameFa: "خبر", slug: "news" },
    { name: "Tool & Resource", nameFa: "ابزار و منبع", slug: "tool-resource" },
    { name: "Opinion", nameFa: "دیدگاه", slug: "opinion" }
  ];

  for (const type of defaultTypes) {
    const existing = await prisma.term.findUnique({
      where: { taxonomyId_slug: { taxonomyId: typeTaxId, slug: type.slug } }
    });
    if (!existing) {
      await prisma.term.create({
        data: {
          taxonomyId: typeTaxId,
          name: type.name,
          nameFa: type.nameFa,
          slug: type.slug,
          description: `Read our ${type.name} articles.`
        }
      });
    }
  }

  // 6. Seed Terms for "skill_level"
  const levelTaxId = taxMap.get("skill_level")!;
  const defaultLevels = [
    { name: "Beginner", nameFa: "مبتدی", slug: "beginner" },
    { name: "Intermediate", nameFa: "متوسط", slug: "intermediate" },
    { name: "Advanced", nameFa: "پیشرفته", slug: "advanced" }
  ];

  for (const lvl of defaultLevels) {
    const existing = await prisma.term.findUnique({
      where: { taxonomyId_slug: { taxonomyId: levelTaxId, slug: lvl.slug } }
    });
    if (!existing) {
      await prisma.term.create({
        data: {
          taxonomyId: levelTaxId,
          name: lvl.name,
          nameFa: lvl.nameFa,
          slug: lvl.slug,
          description: `${lvl.name} level contents.`
        }
      });
    }
  }

  console.log("Seeding completed successfully!");
}
