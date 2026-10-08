import { clampHintTop, getComponent, listComponents } from "@/lib/admin/components-fs";
import { toPascal } from "@/lib/admin/slug";
import { browseItems } from "@/lib/browse/items";
import { titleFaFor } from "@/lib/browse/titles-fa";
import { emptyHighlightPayload } from "@/lib/open/highlight-types";
import { isNewComponent } from "@/lib/open/new-components";
import { extractUsageSnippet } from "@/lib/open/mdx-extract";
import {
  registryItem,
  type PackageManager,
} from "@/lib/open/package-manager";
import type { PreviewBackgrounds } from "@/lib/open/preview-background";
import {
  parsePreviewHint,
  resolvePreviewHint,
  type ResolvedPreviewHint,
} from "@/lib/open/preview-hint-config";
import { source } from "@/lib/source";

export type OpenNavItem = {
  title: string;
  /** Persian label shown smaller under English. */
  titleFa?: string;
  href: string;
  slug: string;
  isNew?: boolean;
  tags?: string[];
};

export type OpenComponentData = {
  slug: string;
  title: string;
  description: string;
  dependencies: string[];
  registryItem: string;
  usage: string;
  /** Filled on demand via /api/open/components/[slug]/highlight */
  usageHtml: string;
  code: string;
  /** Filled on demand via /api/open/components/[slug]/highlight */
  codeHtml: string;
  /** Shiki HTML for CLI install commands — loaded on demand. */
  cliHtml: Record<PackageManager, string>;
  /** Shiki HTML for manual dep install commands — loaded on demand. */
  manualHtml: Record<PackageManager, string>;
  previewBackground?: string | PreviewBackgrounds;
  /** PreviewHint overlay top offset in px. Omit = 80. */
  hintTop?: number;
  previewHint?: ResolvedPreviewHint | null;
};

function defaultUsage(slug: string) {
  const component = toPascal(slug);
  return `import ${component} from "@/components/${slug}";

export default function Page() {
  return <${component} />;
}`;
}

export function getComponentDocsPage(slug: string) {
  return source.getPage(["components", slug]);
}

export async function getOpenNavItems(): Promise<OpenNavItem[]> {
  const items = await listComponents();
  const mapped =
    items.length > 0
      ? items.map((item) => {
          const page = getComponentDocsPage(item.name);
          const browse = browseItems.find((entry) => entry.slug === item.name);
          // Prefer catalog English titles so nav stays bilingual (EN primary).
          return {
            slug: item.name,
            title: browse?.title ?? item.title ?? page?.data.title ?? item.name,
            titleFa: titleFaFor(item.name) ?? browse?.titleFa,
            href: `/docs/components/${item.name}`,
            isNew: isNewComponent(item.name),
            tags: item.tags,
          };
        })
      : browseItems.map((item) => {
          return {
            slug: item.slug,
            title: item.title,
            titleFa: item.titleFa ?? titleFaFor(item.slug),
            href: `/docs/components/${item.slug}`,
            isNew: item.isNew || isNewComponent(item.slug),
            tags: item.tags,
          };
        });
  return mapped.sort((a, b) => a.title.localeCompare(b.title));
}

/** Shell data for the open page — no Shiki. Highlight loads when Code opens. */
export async function getOpenComponent(slug: string): Promise<OpenComponentData | null> {
  const record = await getComponent(slug);
  const docsPage = getComponentDocsPage(slug);
  const browse = browseItems.find((item) => item.slug === slug);
  if (!record && !docsPage && !browse) return null;

  const title = docsPage?.data.title ?? record?.item.title ?? browse?.title ?? slug;
  const description =
    docsPage?.data.description ?? record?.item.description ?? browse?.description ?? "";
  const dependencies = record?.item.dependencies?.filter(Boolean) ?? [];
  const code = record?.code ?? "";
  const usage = extractUsageSnippet(record?.mdx ?? "", defaultUsage(slug));
  const empty = emptyHighlightPayload();

  return {
    slug,
    title,
    description,
    dependencies,
    registryItem: registryItem(slug),
    usage,
    usageHtml: empty.usageHtml,
    code,
    codeHtml: empty.codeHtml,
    cliHtml: empty.cliHtml,
    manualHtml: empty.manualHtml,
    previewBackground: record?.controls?.previewBackground,
    hintTop: clampHintTop(record?.controls?.hintTop),
    previewHint: resolvePreviewHint(parsePreviewHint(record?.controls)),
  };
}
