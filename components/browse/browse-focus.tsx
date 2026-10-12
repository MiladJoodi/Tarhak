"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, X } from "lucide-react";

import type { BrowseItem } from "@/lib/browse/items";
import { BrowseInstallButton } from "@/components/browse/browse-install-button";
import { BrowsePreview } from "@/components/browse/browse-preview";
import { NewDot } from "@/components/ui/new-dot";
import { cn } from "@/lib/utils";

export function BrowseFocus({
  items,
  focusSlug,
  paused,
  onClose,
  onFocus,
}: {
  items: BrowseItem[];
  focusSlug: string;
  paused: boolean;
  onClose: () => void;
  onFocus: (slug: string) => void;
}) {
  const index = React.useMemo(
    () => items.findIndex((item) => item.slug === focusSlug),
    [items, focusSlug],
  );
  const item = index >= 0 ? items[index] : null;

  React.useEffect(() => {
    if (!item && focusSlug) onClose();
  }, [item, focusSlug, onClose]);

  const go = React.useCallback(
    (delta: number) => {
      if (items.length === 0 || index < 0) return;
      // RTL: visual "next" is to the left → ArrowLeft advances.
      const next = (index + delta + items.length) % items.length;
      const target = items[next];
      if (target) onFocus(target.slug);
    },
    [index, items, onFocus],
  );

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!item) return null;

  const title = item.titleFa ?? item.title;

  return (
    <div
      className="browse-focus fixed inset-0 z-50 flex flex-col bg-black/72 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      dir="rtl"
      lang="fa"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {item.isNew ? <NewDot /> : null}
          <h2 className="truncate font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-base font-medium text-white sm:text-lg">
            {title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BrowseInstallButton slug={item.slug} />
          <Link
            href={`/docs/components/${item.slug}`}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium",
              "bg-white text-black transition-opacity hover:opacity-90",
            )}
          >
            <ExternalLink className="size-3.5" aria-hidden />
            اسناد
          </Link>
          <button
            type="button"
            aria-label="بستن"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-white/85 ring-1 ring-white/15 hover:bg-white/15"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-10">
        <button
          type="button"
          aria-label="قبلی"
          onClick={() => go(-1)}
          className="browse-focus-nav absolute start-2 top-1/2 z-10 -translate-y-1/2"
        >
          <ArrowRight className="size-5" aria-hidden />
        </button>

        <div className="browse-focus-stage relative aspect-4/3 w-full max-w-3xl overflow-hidden rounded-2xl ring-1 ring-white/12 sm:aspect-video">
          <BrowsePreview
            poster={item.poster}
            fallbackPoster={item.fallbackPoster}
            video={item.video}
            eager
            paused={paused}
            allowVideo
            playbackPriority={0}
          />
        </div>

        <button
          type="button"
          aria-label="بعدی"
          onClick={() => go(1)}
          className="browse-focus-nav absolute end-2 top-1/2 z-10 -translate-y-1/2"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
      </div>

      <p className="pb-4 text-center text-[11px] text-white/40 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif]">
        ← → جابه‌جایی · Esc بستن
      </p>
    </div>
  );
}
