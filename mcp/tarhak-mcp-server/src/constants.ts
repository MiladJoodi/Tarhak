export const SITE_ORIGIN =
  process.env.TARHAK_SITE_URL?.replace(/\/$/, "") ?? "https://tarhak.ir";

/** Public registry base, e.g. https://tarhak.ir/r */
export const REGISTRY_BASE =
  process.env.TARHAK_REGISTRY_BASE?.replace(/\/$/, "") ??
  `${SITE_ORIGIN}/r`;

export const REGISTRY_NAMESPACE = "@tarhak";

export const CHARACTER_LIMIT = 25_000;

/** Cache catalog in memory (ms). */
export const CATALOG_TTL_MS = Number(process.env.TARHAK_CATALOG_TTL_MS ?? 60_000);

export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];
