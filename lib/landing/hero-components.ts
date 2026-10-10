import { promises as fs } from "fs";
import path from "path";

import { browseItems, type BrowseItem } from "@/lib/browse/items";
import { LANDING_HERO_LIMIT } from "@/lib/landing/constants";

export { LANDING_HERO_LIMIT };

const ROOT = process.cwd();
const LANDING_HERO_PATH = path.join(ROOT, "registry/default/landing-hero.json");

/** Skip in the hero spotlight — awkward framing, chrome-heavy, or English-only media. */
const HERO_EXCLUDE = new Set([
  "gooey-navbar",
  "photo-albums",
  "expandable-gallery",
  "dynamic-grid-gallery",
]);

export type LandingHeroConfig = { slugs: string[] };

function isHeroEligible(slug: string) {
  return Boolean(slug) && !HERO_EXCLUDE.has(slug);
}

export async function readLandingHeroConfig(): Promise<LandingHeroConfig> {
  try {
    const raw = JSON.parse(await fs.readFile(LANDING_HERO_PATH, "utf8")) as LandingHeroConfig;
    const slugs = Array.isArray(raw.slugs)
      ? raw.slugs
          .filter((s): s is string => typeof s === "string" && isHeroEligible(s))
          .slice(0, LANDING_HERO_LIMIT)
      : [];
    return { slugs };
  } catch {
    return { slugs: [] };
  }
}

export async function writeLandingHeroConfig(slugs: string[]): Promise<LandingHeroConfig> {
  const unique = [
    ...new Set(
      slugs
        .map((s) => s.trim())
        .filter((s) => isHeroEligible(s)),
    ),
  ].slice(0, LANDING_HERO_LIMIT);
  const next: LandingHeroConfig = { slugs: unique };
  await fs.mkdir(path.dirname(LANDING_HERO_PATH), { recursive: true });
  await fs.writeFile(LANDING_HERO_PATH, JSON.stringify(next, null, 2) + "\n");
  return next;
}

/** Sync resolve for the landing page — local browse-media posters/videos. */
export function resolveLandingHeroItems(slugs: string[]): BrowseItem[] {
  const bySlug = new Map(browseItems.map((item) => [item.slug, item]));
  const picked = slugs
    .filter(isHeroEligible)
    .map((slug) => bySlug.get(slug))
    .filter((item): item is BrowseItem => Boolean(item))
    .slice(0, LANDING_HERO_LIMIT);

  if (picked.length >= LANDING_HERO_LIMIT) return picked;

  // Fill remaining slots from the library so the hero never looks empty.
  for (const item of browseItems) {
    if (picked.length >= LANDING_HERO_LIMIT) break;
    if (!isHeroEligible(item.slug)) continue;
    if (picked.some((p) => p.slug === item.slug)) continue;
    picked.push(item);
  }
  return picked;
}

export async function getLandingHeroItems(): Promise<BrowseItem[]> {
  const { slugs } = await readLandingHeroConfig();
  return resolveLandingHeroItems(slugs);
}
