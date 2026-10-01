"use client";

import * as React from "react";

import type { BrowseItem } from "@/lib/browse/items";

/**
 * Measures each item's poster and reports `slug -> width/height`.
 *
 * Keyed on a fingerprint of the slugs and poster URLs rather than the array
 * identity, so a caller that rebuilds its list every render does not restart
 * every decode. Repeated slugs are measured once.
 */
export function usePosterAspects(items: BrowseItem[]) {
  const [aspects, setAspects] = React.useState<Record<string, number>>({});
  const key = items.map((item) => `${item.slug}:${item.poster}`).join("|");

  const setAspect = React.useCallback((slug: string, ratio: number) => {
    if (!Number.isFinite(ratio) || ratio <= 0) return;
    setAspects((current) =>
      current[slug] === ratio ? current : { ...current, [slug]: ratio },
    );
  }, []);

  React.useEffect(() => {
    let live = true;
    let raf = 0;
    const pending: Record<string, number> = {};

    const flush = () => {
      raf = 0;
      if (!live) return;
      setAspects((current) => {
        let changed = false;
        const merged = { ...current };
        for (const [slug, ratio] of Object.entries(pending)) {
          if (merged[slug] !== ratio) {
            merged[slug] = ratio;
            changed = true;
          }
        }
        return changed ? merged : current;
      });
    };

    const seen = new Set<string>();
    const loading: HTMLImageElement[] = [];

    for (const item of items) {
      if (!item.poster || seen.has(item.slug)) continue;
      seen.add(item.slug);
      const img = new Image();
      loading.push(img);
      img.onload = () => {
        if (!live || img.naturalWidth < 1 || img.naturalHeight < 1) return;
        pending[item.slug] = img.naturalWidth / img.naturalHeight;
        if (!raf) raf = requestAnimationFrame(flush);
      };
      img.src = item.poster;
    }

    return () => {
      live = false;
      if (raf) cancelAnimationFrame(raf);
      // Detaching matters: a poster that decodes after teardown would otherwise
      // schedule a frame against the list this effect has already abandoned.
      for (const img of loading) img.onload = null;
    };
    // `key` is the fingerprint of `items`; depending on the array itself would
    // restart every decode whenever the caller rebuilds the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { aspects, setAspect };
}
