import { Request, Response } from "express";
import { prisma } from "../db.js";

export async function getSitemap(req: Request, res: Response) {
  try {
    const appUrl = process.env.APP_URL || "https://betavan.ir";

    // Fetch published posts, static pages, terms, and products
    const [posts, pages, terms, products] = await Promise.all([
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true }
      }),
      prisma.page.findMany({
        select: { slug: true, updatedAt: true }
      }),
      prisma.term.findMany({
        include: { taxonomy: true }
      }),
      prisma.product.findMany({
        where: { status: "published" },
        select: { slug: true, createdAt: true }
      })
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add homepage
    xml += `  <url>\n`;
    xml += `    <loc>${appUrl}</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Add posts
    posts.forEach(post => {
      xml += `  <url>\n`;
      xml += `    <loc>${appUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${post.updatedAt.toISOString().split("T")[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add static pages
    pages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${appUrl}/${page.slug}</loc>\n`;
      xml += `    <lastmod>${page.updatedAt.toISOString().split("T")[0]}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.5</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add terms (Archive pages)
    terms.forEach(term => {
      const prefix = term.taxonomy?.urlPrefix || "category";
      xml += `  <url>\n`;
      xml += `    <loc>${appUrl}/${prefix}/${term.slug}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add products
    products.forEach(product => {
      xml += `  <url>\n`;
      xml += `    <loc>${appUrl}/product/${product.slug}</loc>\n`;
      xml += `    <lastmod>${product.createdAt.toISOString().split("T")[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    return res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return res.status(500).send("Error generating sitemap");
  }
}

export function getRobotsTxt(req: Request, res: Response) {
  const appUrl = process.env.APP_URL || "https://betavan.ir";
  
  const robots = `User-agent: *
Allow: /

Sitemap: ${appUrl}/sitemap.xml
`;

  res.header("Content-Type", "text/plain");
  return res.send(robots);
}
