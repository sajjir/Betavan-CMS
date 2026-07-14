import { prisma } from "./db.js";
import { hashPassword } from "./hash.js";

export async function seedDatabase() {
  console.log("Checking if database needs seeding...");
  
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

    // Create the seeded admin
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash: hashPassword(adminPassword),
        role: "ADMIN"
      }
    });

    // Seed some categories to start with
    const categories = [
      { name: "AI & Technology", slug: "ai-technology" },
      { name: "Business & Entrepreneurship", slug: "business-entrepreneurship" },
      { name: "Marketing", slug: "marketing" }
    ];

    for (const cat of categories) {
      await prisma.category.create({
        data: cat
      });
    }

    // Seed some tags
    const tags = [
      { name: "Artificial Intelligence", slug: "ai" },
      { name: "SaaS", slug: "saas" },
      { name: "Startup", slug: "startup" },
      { name: "Video Tutorials", slug: "tutorials" }
    ];

    for (const t of tags) {
      await prisma.tag.create({
        data: t
      });
    }

    console.log("Seeding completed successfully!");
  } else {
    console.log("Database already has users. Skipping seeding.");
  }
}
