/**
 * Writes a static public/sitemap.xml so Google never hits a Next.js route
 * (dynamic sitemap routes have been returning intermittent 500s to external crawlers).
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const SITE_URL = "https://tarhak.ir";
const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, "content", "docs");
const OUT_FILE = path.join(ROOT, "public", "sitemap.xml");

/** Stub / non-indexable docs to keep out of the sitemap. */
const SKIP_SLUGS = new Set(["dd"]);

type Entry = {
  loc: string;
  changefreq: string;
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

async function walkMdx(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkMdx(full)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      out.push(full);
    }
  }
  return out;
}

function docsPathToUrl(filePath: string): string | null {
  const rel = path.relative(DOCS_DIR, filePath).replaceAll("\\", "/");
  if (!rel.endsWith(".mdx")) return null;
  const noExt = rel.slice(0, -4);
  const segments = noExt.split("/");
  const leaf = segments[segments.length - 1]!;
  if (SKIP_SLUGS.has(leaf)) return null;

  if (leaf === "index") {
    const parent = segments.slice(0, -1).join("/");
    return parent ? `/docs/${parent}` : "/docs";
  }
  return `/docs/${noExt}`;
}

async function main() {
  const lastmod = new Date().toISOString();
  const seen = new Set<string>();
  const entries: Entry[] = [];

  const push = (pathname: string, changefreq: string, priority: string) => {
    const loc = pathname === "/" ? SITE_URL : `${SITE_URL}${pathname}`;
    if (seen.has(loc)) return;
    seen.add(loc);
    entries.push({ loc, changefreq, priority });
  };

  push("/", "daily", "1.0");
  push("/browse", "daily", "0.9");
  push("/sponsor", "monthly", "0.6");

  const files = await walkMdx(DOCS_DIR);
  for (const file of files.sort()) {
    const url = docsPathToUrl(file);
    if (!url) continue;
    push(url, "weekly", "0.7");
  }

  const body = entries
    .map(
      (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, xml, "utf8");
  console.log(`✓ Wrote ${entries.length} URLs → ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
