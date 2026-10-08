"use client";

import * as React from "react";

import { useOpenPanel } from "@/components/open/open-panel-context";
import { OpenCliBar } from "@/components/open/open-cli-bar";
import { OpenDrawer } from "@/components/open/open-drawer";
import { OpenCodePanel } from "@/components/open/open-panels";
import { OpenPreview } from "@/components/open/open-preview";
import { usePackageManager } from "@/components/open/use-package-manager";
import { scrollbarMinimal } from "@/components/open/ui";
import { useOpenHighlight } from "@/hooks/use-open-highlight";
import type { OpenComponentData } from "@/lib/open/component";
import {
  parsePreviewBackgrounds,
  resolvePreviewBackground,
} from "@/lib/open/preview-background";
import { hintToneForBackground } from "@/lib/open/preview-hint-config";
import { cn } from "@/lib/utils";

export function OpenComponentView({
  data,
  docsContent,
}: {
  data: OpenComponentData;
  docsContent?: React.ReactNode;
}) {
  const { panel, setPanel, stage, previewTheme } = useOpenPanel();
  const [manager, setManager] = usePackageManager();
  const backgrounds = React.useMemo(
    () => parsePreviewBackgrounds(data.previewBackground),
    [data.previewBackground],
  );
  const previewBackground = resolvePreviewBackground(backgrounds, previewTheme);
  const hintTone = hintToneForBackground(previewBackground);
  const codeOpen = panel === "code";
  const { highlight, loading: highlightLoading } = useOpenHighlight(
    data.slug,
    codeOpen,
  );

  return (
    <>
      <main
        className={cn(
          "grid h-full min-h-0 w-full min-w-0 flex-1 overflow-auto",
          scrollbarMinimal,
        )}
        style={
          {
            ...(previewBackground ? { background: previewBackground } : {}),
            "--preview-hint-top": `${data.hintTop ?? 80}px`,
          } as React.CSSProperties
        }
      >
        <OpenPreview
          name={data.slug}
          hintTop={data.hintTop}
          hint={stage ? null : data.previewHint}
          hintTone={hintTone}
          theme={previewTheme}
        />
      </main>

      {stage ? null : (
        <div className="pointer-events-none absolute bottom-[18px] left-1/2 z-20 -translate-x-1/2 *:pointer-events-auto">
          <OpenCliBar
            registryItem={data.registryItem}
            manager={manager}
            onManagerChange={setManager}
          />
        </div>
      )}

      <OpenDrawer
        open={codeOpen}
        onClose={() => setPanel(null)}
        title="Get this Component"
        wide
      >
        {highlightLoading ? (
          <div className="flex min-w-0 flex-col gap-[22px] pb-4" aria-busy="true">
            <div className="h-56 animate-pulse rounded-xl bg-white/8" />
            <div className="h-40 animate-pulse rounded-xl bg-white/6" />
            <div className="h-24 animate-pulse rounded-xl bg-white/5" />
          </div>
        ) : (
          <OpenCodePanel
            description={data.description}
            docsContent={docsContent}
            usage={data.usage}
            usageHtml={highlight.usageHtml}
            code={data.code}
            codeHtml={highlight.codeHtml}
            cliHtml={highlight.cliHtml}
            manualHtml={highlight.manualHtml}
            registryItem={data.registryItem}
            dependencies={data.dependencies}
            manager={manager}
            onManagerChange={setManager}
            slug={data.slug}
          />
        )}
      </OpenDrawer>
    </>
  );
}
