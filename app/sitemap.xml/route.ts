import { sitemapResponse } from "@/lib/sitemap";

/** Canonical root sitemap for crawlers and robots.txt. */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return sitemapResponse();
}
