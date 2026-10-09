"use client";

import * as React from "react";
import type { BrowseItem } from "@/lib/browse/items";
import { rankSearchItems } from "@/lib/component-tags";
import { useRenderQuality } from "@/lib/browse/use-render-quality";
import { BrowseGrid } from "./browse-grid";
import { BrowseHeader } from "./browse-header";
import { BrowseToolbar, type ViewMode } from "./browse-toolbar";
import { InfiniteCanvas } from "./infinite-canvas";
import { cn } from "@/lib/utils";

export function BrowseExperience({
  items,
  stars,
}: {
  items: BrowseItem[];
  stars?: number | null;
}) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("canvas");
  const [query, setQuery] = React.useState("");
  const [paused, setPaused] = React.useState(false);
  const quality = useRenderQuality();

  const filtered = React.useMemo(() => {
    return rankSearchItems(items, query, (item) => ({
      name: `${item.titleFa ?? ""} ${item.title} ${item.slug}`,
      tags: item.tags,
      extra: `${item.description} ${item.category}`,
    }));
  }, [items, query]);

  const isEmpty = filtered.length === 0;
  const isCanvas = viewMode === "canvas";
  const hasQuery = query.trim().length > 0;

  return (
    <div
      data-quality={quality}
      className="dark flex h-dvh cursor-auto flex-col overflow-hidden bg-background font-sans text-foreground"
      dir="rtl"
      lang="fa"
    >
      <BrowseHeader
        query={query}
        onQueryChange={setQuery}
        stars={stars}
        resultCount={filtered.length}
        totalCount={items.length}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden px-3 pt-0.5 pb-2.5">
        <div className="relative min-h-0 w-full min-w-0 flex-1">
          <div
            data-view={isCanvas ? "canvas" : "grid"}
            className={cn(
              "relative h-full rounded-2xl bg-muted p-4 sm:p-[18px]",
              isCanvas ? "overflow-hidden" : "overflow-auto",
            )}
          >
            {isEmpty && hasQuery ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-8 text-center font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif]">
                <p className="text-[15px] text-white/55">
                  چیزی برای «{query.trim()}» پیدا نشد.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium text-white/85 transition-colors hover:bg-white/15"
                >
                  پاک کردن جستجو
                </button>
              </div>
            ) : isEmpty ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-8 text-center font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif]">
                <p className="text-[15px] text-white/45">هنوز کامپوننتی نیست.</p>
              </div>
            ) : isCanvas ? (
              <InfiniteCanvas items={filtered} paused={paused} />
            ) : (
              <BrowseGrid items={filtered} paused={paused} />
            )}
          </div>
        </div>
      </div>

      <BrowseToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        paused={paused}
        onPausedChange={setPaused}
      />
    </div>
  );
}
