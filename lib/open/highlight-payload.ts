import { getComponent } from "@/lib/admin/components-fs";
import { toPascal } from "@/lib/admin/slug";
import { browseItems } from "@/lib/browse/items";
import { highlightCode } from "@/lib/open/highlight";
import type { OpenHighlightPayload } from "@/lib/open/highlight-types";
import { extractUsageSnippet } from "@/lib/open/mdx-extract";
import {
  cliInstallCommand,
  manualInstallCommand,
  PACKAGE_MANAGERS,
  registryItem,
  type PackageManager,
} from "@/lib/open/package-manager";
import { source } from "@/lib/source";

export type { OpenHighlightPayload } from "@/lib/open/highlight-types";
export { emptyHighlightPayload } from "@/lib/open/highlight-types";

async function highlightShellCommands(
  build: (manager: PackageManager) => string,
): Promise<Record<PackageManager, string>> {
  const out = {
    npm: "",
    yarn: "",
    pnpm: "",
    bun: "",
  } satisfies Record<PackageManager, string>;
  await Promise.all(
    PACKAGE_MANAGERS.map(async (manager) => {
      const command = build(manager);
      out[manager] = command
        ? await highlightCode(command, "bash", { showLineNumbers: false })
        : "";
    }),
  );
  return out;
}

function defaultUsage(slug: string) {
  const component = toPascal(slug);
  return `import ${component} from "@/components/${slug}";

export default function Page() {
  return <${component} />;
}`;
}

/** Shiki HTML for the Code drawer — loaded on demand, not in the page RSC. */
export async function getOpenComponentHighlight(
  slug: string,
): Promise<OpenHighlightPayload | null> {
  const record = await getComponent(slug);
  const docsPage = source.getPage(["components", slug]);
  const browse = browseItems.find((item) => item.slug === slug);
  if (!record && !docsPage && !browse) return null;

  const dependencies = record?.item.dependencies?.filter(Boolean) ?? [];
  const code = record?.code ?? "";
  const usage = extractUsageSnippet(record?.mdx ?? "", defaultUsage(slug));
  const item = registryItem(slug);

  const [usageHtml, codeHtml, cliHtml, manualHtml] = await Promise.all([
    highlightCode(usage, "tsx", { showLineNumbers: false }),
    code ? highlightCode(code, "tsx", { showLineNumbers: false }) : Promise.resolve(""),
    highlightShellCommands((manager) => cliInstallCommand(manager, item)),
    highlightShellCommands((manager) =>
      manualInstallCommand(manager, dependencies),
    ),
  ]);

  return { usageHtml, codeHtml, cliHtml, manualHtml };
}
