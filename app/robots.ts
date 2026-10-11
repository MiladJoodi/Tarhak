import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/preview", "/api", "/v1"],
    },
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemap/sitemap.xml`,
    ],
    host: "tarhak.ir",
  };
}
