/**
 * Sets page SEO metadata and injects JSON-LD Structured Data
 */
export function setPageSeo({
  title,
  description,
  jsonLd
}: {
  title?: string;
  description?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}) {
  if (title) {
    document.title = title;
  }
  
  if (description !== undefined) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description || "");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = description || "";
      document.head.appendChild(newMeta);
    }
  }

  // Handle JSON-LD Schema
  const existingScript = document.getElementById("jsonld-schema");
  if (existingScript) {
    existingScript.remove();
  }

  if (jsonLd) {
    const script = document.createElement("script");
    script.id = "jsonld-schema";
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
}

/**
 * Removes JSON-LD Schema on unmount
 */
export function clearJsonLd() {
  const existingScript = document.getElementById("jsonld-schema");
  if (existingScript) {
    existingScript.remove();
  }
}

/**
 * Generates Organization JSON-LD Structured Data
 */
export function getOrganizationSchema(origin: string): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Betavan",
    "alternateName": "بتوان",
    "url": origin,
    "logo": `${origin}/assets/logo.png`,
    "description": "Betavan - AI-Powered Web Application & Professional Content Platform"
  };
}

/**
 * Generates Article JSON-LD Structured Data
 */
export function getArticleSchema({
  title,
  description,
  datePublished,
  dateModified,
  authorName,
  imageUrl,
  url
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  imageUrl: string;
  url: string;
}): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "headline": title,
    "description": description,
    "image": imageUrl,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": authorName || "Admin"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Betavan",
      "logo": {
        "@type": "ImageObject",
        "url": `${new URL(url).origin}/assets/logo.png`
      }
    }
  };
}

/**
 * Generates Product JSON-LD Structured Data
 */
export function getProductSchema({
  name,
  description,
  imageUrl,
  price,
  currency = "IRT", // Toman
  availability = "InStock",
  url
}: {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock";
  url: string;
}): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": imageUrl,
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": currency,
      "price": price,
      "availability": availability === "InStock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
}

/**
 * Generates BreadcrumbList JSON-LD Structured Data
 */
export function getBreadcrumbSchema(items: { name: string; item: string }[]): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  };
}
