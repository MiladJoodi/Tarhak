import { sitemapResponse } from "@/lib/sitemap";

/** Nested path — GSC often caches failed fetches of root /sitemap.xml. */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return sitemapResponse();
}
