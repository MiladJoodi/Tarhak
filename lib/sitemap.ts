import { source } from "@/lib/source";

export const SITE_URL = "https://tarhak.ir";

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function collectEntries(): SitemapEntry[] {
  const lastmod = new Date().toISOString();
  const seen = new Set<string>();
  const entries: SitemapEntry[] = [];

  const push = (
    path: string,
    changefreq: SitemapEntry["changefreq"],
    priority: string,
  ) => {
    const loc = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
    if (seen.has(loc)) return;
    seen.add(loc);
    entries.push({ loc, lastmod, changefreq, priority });
  };

  push("/", "daily", "1.0");
  push("/browse", "daily", "0.9");
  push("/sponsor", "monthly", "0.6");
  push("/contact", "monthly", "0.5");

  try {
    for (const page of source.getPages()) {
      if (!page.url) continue;
      push(page.url, "weekly", "0.7");
    }
  } catch {
    // Keep static URLs if docs source is unavailable at request time.
  }

  return entries;
}

export function buildSitemapXml() {
  const body = collectEntries()
    .map(
      (entry) =>
        `<url><loc>${escapeXml(entry.loc)}</loc><lastmod>${entry.lastmod}</lastmod><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>\n`;
}

export function sitemapResponse() {
  return new Response(buildSitemapXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
