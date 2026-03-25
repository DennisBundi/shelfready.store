import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://shelfready.store",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://shelfready.store/privacy",
      lastModified: new Date("2026-03-24"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://shelfready.store/terms",
      lastModified: new Date("2026-03-24"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
