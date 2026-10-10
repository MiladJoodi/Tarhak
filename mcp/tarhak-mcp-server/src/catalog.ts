import {
  CATALOG_TTL_MS,
  CHARACTER_LIMIT,
  PACKAGE_MANAGERS,
  REGISTRY_BASE,
  REGISTRY_NAMESPACE,
  SITE_ORIGIN,
  type PackageManager,
} from "./constants.js";

export type RegistryItem = {
  name: string;
  title?: string;
  description?: string;
  type?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: { path: string; type?: string; content?: string }[];
};

export type ComponentSummary = {
  slug: string;
  registry_item: string;
  title: string;
  description: string;
  dependencies: string[];
  docs_url: string;
  preview_url: string;
  registry_url: string;
};

type RegistryFile = {
  name?: string;
  homepage?: string;
  items: RegistryItem[];
};

type CatalogCache = {
  fetchedAt: number;
  base: string;
  summaries: ComponentSummary[];
  bySlug: Map<string, ComponentSummary>;
};

let cache: CatalogCache | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (${res.status} ${res.statusText})`);
  }
  return (await res.json()) as T;
}

function toSummary(item: RegistryItem): ComponentSummary {
  const slug = item.name;
  return {
    slug,
    registry_item: `${REGISTRY_NAMESPACE}/${slug}`,
    title: item.title ?? slug,
    description: item.description ?? "",
    dependencies: item.dependencies ?? [],
    docs_url: `${SITE_ORIGIN}/docs/components/${slug}`,
    preview_url: `${SITE_ORIGIN}/preview/${slug}`,
    registry_url: `${REGISTRY_BASE}/${slug}.json`,
  };
}

/** Load component index from the public Tarhak registry (remote). */
export async function loadCatalog(force = false) {
  const now = Date.now();
  if (
    !force &&
    cache &&
    cache.base === REGISTRY_BASE &&
    now - cache.fetchedAt < CATALOG_TTL_MS
  ) {
    return cache;
  }

  const registryUrl = `${REGISTRY_BASE}/registry.json`;
  const registry = await fetchJson<RegistryFile>(registryUrl);
  if (!registry?.items?.length) {
    throw new Error(
      `Tarhak registry at ${registryUrl} is empty or invalid. Check TARHAK_SITE_URL / TARHAK_REGISTRY_BASE.`,
    );
  }

  const summaries = registry.items.map(toSummary);
  summaries.sort((a, b) => a.slug.localeCompare(b.slug));

  cache = {
    fetchedAt: now,
    base: REGISTRY_BASE,
    summaries,
    bySlug: new Map(summaries.map((s) => [s.slug, s])),
  };
  return cache;
}

export async function searchComponents(
  query: string,
  limit = 20,
  offset = 0,
) {
  const { summaries } = await loadCatalog();
  const q = query.trim().toLowerCase();
  const matched = !q
    ? summaries
    : summaries.filter((item) => {
        const hay = [
          item.slug,
          item.title,
          item.description,
          item.registry_item,
          item.dependencies.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return q.split(/\s+/).every((part) => hay.includes(part));
      });

  const slice = matched.slice(offset, offset + limit);
  return {
    source: REGISTRY_BASE,
    total: matched.length,
    count: slice.length,
    offset,
    has_more: offset + slice.length < matched.length,
    next_offset:
      offset + slice.length < matched.length
        ? offset + slice.length
        : undefined,
    components: slice,
  };
}

export async function listComponents(opts: {
  limit?: number;
  offset?: number;
}) {
  const { summaries } = await loadCatalog();
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const slice = summaries.slice(offset, offset + limit);

  return {
    source: REGISTRY_BASE,
    site: SITE_ORIGIN,
    total: summaries.length,
    count: slice.length,
    offset,
    has_more: offset + slice.length < summaries.length,
    next_offset:
      offset + slice.length < summaries.length
        ? offset + slice.length
        : undefined,
    components: slice,
  };
}

export async function getComponentDetail(
  slugOrItem: string,
  includeSource = false,
) {
  const { bySlug } = await loadCatalog();
  const slug = slugOrItem
    .trim()
    .replace(new RegExp(`^${REGISTRY_NAMESPACE}/`), "");
  const summary = bySlug.get(slug);
  if (!summary) {
    const suggestions = (await searchComponents(slug, 5)).components.map(
      (c) => c.slug,
    );
    return {
      error: `Component "${slug}" not found in Tarhak registry.`,
      suggestions,
      hint: "Use tarhak_search_components to discover valid slugs.",
      registry: REGISTRY_BASE,
    };
  }

  let item: RegistryItem;
  try {
    item = await fetchJson<RegistryItem>(summary.registry_url);
  } catch (error) {
    return {
      error: `Could not load ${summary.registry_url}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      summary,
    };
  }

  let source: { path: string; language: string; content: string } | undefined;
  if (includeSource) {
    const file = item.files?.[0];
    const content = file?.content;
    const filePath = file?.path ?? `registry/default/example/${slug}.tsx`;
    if (content) {
      let clipped = content;
      if (clipped.length > CHARACTER_LIMIT) {
        clipped =
          clipped.slice(0, CHARACTER_LIMIT) +
          `\n\n/* …truncated (${content.length} chars total) */\n`;
      }
      source = {
        path: filePath,
        language: filePath.endsWith(".tsx") ? "tsx" : "ts",
        content: clipped,
      };
    }
  }

  return {
    ...summary,
    type: item.type ?? "registry:component",
    registry_dependencies: item.registryDependencies ?? [],
    dependencies: item.dependencies ?? summary.dependencies,
    files: (item.files ?? []).map((f) => ({
      path: f.path,
      type: f.type,
      has_content: Boolean(f.content),
    })),
    install: installCommands(summary.registry_item),
    source,
  };
}

export function installCommands(
  item: string,
  manager?: PackageManager,
): Record<string, string> | { command: string; manager: PackageManager } {
  const target = item.startsWith("@")
    ? item
    : `${REGISTRY_NAMESPACE}/${item.replace(/^@tarhak\//, "")}`;

  const all = {
    npm: `npx farsiui@latest add ${target}`,
    pnpm: `pnpm dlx farsiui@latest add ${target}`,
    yarn: `yarn dlx farsiui@latest add ${target}`,
    bun: `bunx --bun farsiui@latest add ${target}`,
  } as const;

  if (manager && PACKAGE_MANAGERS.includes(manager)) {
    return { manager, command: all[manager] };
  }
  return { ...all };
}
