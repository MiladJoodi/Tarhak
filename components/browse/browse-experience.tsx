"use client";

import * as React from "react";

import type { BrowseItem } from "@/lib/browse/items";
import { browseCollectionById } from "@/lib/browse/collections";
import { useBrowseUrlState } from "@/lib/browse/use-browse-url-state";
import { rankSearchItems } from "@/lib/component-tags";
import { useRenderQuality } from "@/lib/browse/use-render-quality";
import { BrowseFocus } from "./browse-focus";
import { BrowseGrid } from "./browse-grid";
import { BrowseHeader } from "./browse-header";
import { BrowseToolbar } from "./browse-toolbar";
import { InfiniteCanvas } from "./infinite-canvas";
import { cn } from "@/lib/utils";

function BrowseExperienceInner({
  items,
  stars,
}: {
  items: BrowseItem[];
  stars?: number | null;
}) {
  const {
    query,
    category,
    view: viewMode,
    collection,
    focus,
    setQuery,
    setCategory,
    setView,
    setCollection,
    setFocus,
    clearFilters,
  } = useBrowseUrlState();
  const [paused, setPaused] = React.useState(false);
  const quality = useRenderQuality();

  const filtered = React.useMemo(() => {
    let pool = items;

    const col = collection ? browseCollectionById(collection) : null;
    if (col) {
      const allowed = new Set(col.slugs);
      pool = pool.filter((item) => allowed.has(item.slug));
    }

    if (category) {
      pool = pool.filter((item) => item.category === category);
    }

    return rankSearchItems(pool, query, (item) => ({
      name: `${item.titleFa ?? ""} ${item.title} ${item.slug}`,
      tags: item.tags,
      extra: `${item.description} ${item.category}`,
    }));
  }, [items, query, category, collection]);

  const isEmpty = filtered.length === 0;
  const isCanvas = viewMode === "canvas";
  const hasQuery = query.trim().length > 0;
  const hasFilters = hasQuery || Boolean(category) || Boolean(collection);
  const focused = Boolean(focus);

  return (
    <div
      data-quality={quality}
      data-focused={focused ? "true" : "false"}
      className="browse-experience dark flex h-dvh cursor-auto flex-col overflow-hidden bg-background font-sans text-foreground"
      dir="rtl"
      lang="fa"
    >
      <BrowseHeader
        query={query}
        onQueryChange={setQuery}
        stars={stars}
        resultCount={filtered.length}
        totalCount={items.length}
        filtersActive={hasFilters}
        category={category}
        onCategoryChange={setCategory}
        collection={collection}
        onCollectionChange={setCollection}
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
            {isEmpty && hasFilters ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-8 text-center font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif]">
                <p className="text-[15px] text-white/55">
                  {hasQuery
                    ? `چیزی برای «${query.trim()}» پیدا نشد.`
                    : "در این فیلتر کامپوننتی نیست."}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium text-white/85 transition-colors hover:bg-white/15"
                >
                  پاک کردن فیلترها
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
        onViewModeChange={setView}
        paused={paused}
        onPausedChange={setPaused}
      />

      {focused ? (
        <BrowseFocus
          items={filtered}
          focusSlug={focus}
          paused={paused}
          onClose={() => setFocus("")}
          onFocus={setFocus}
        />
      ) : null}
    </div>
  );
}

export function BrowseExperience(props: {
  items: BrowseItem[];
  stars?: number | null;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="dark flex h-dvh items-center justify-center bg-background text-white/50">
          در حال بارگذاری…
        </div>
      }
    >
      <BrowseExperienceInner {...props} />
    </React.Suspense>
  );
}
