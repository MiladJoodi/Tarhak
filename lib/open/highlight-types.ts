import type { PackageManager } from "@/lib/open/package-manager";

export type OpenHighlightPayload = {
  usageHtml: string;
  codeHtml: string;
  cliHtml: Record<PackageManager, string>;
  manualHtml: Record<PackageManager, string>;
};

export function emptyHighlightPayload(): OpenHighlightPayload {
  return {
    usageHtml: "",
    codeHtml: "",
    cliHtml: { npm: "", yarn: "", pnpm: "", bun: "" },
    manualHtml: { npm: "", yarn: "", pnpm: "", bun: "" },
  };
}
