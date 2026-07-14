import { prisma } from "./db.js";
import { hashPassword } from "./hash.js";

export async function seedDatabase() {
  console.log("Checking if database needs seeding...");
  
  // Seed admin user
  const adminEmail = "admin@betavan.ir";
  const userCount = await prisma.user.count();
  
  if (userCount === 0) {
    console.log("No users found. Seeding default admin users...");
    
    // Create admin@betavan.ir
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Betavan Admin",
        passwordHash: hashPassword("admin123"),
        role: "ADMIN"
      }
    });

    // Create betavan.co@gmail.com
    await prisma.user.create({
      data: {
        email: "betavan.co@gmail.com",
        name: "Betavan Founder",
        passwordHash: hashPassword("admin123"),
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
