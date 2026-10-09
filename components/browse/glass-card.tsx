"use client";

import * as React from "react";
import Link, { useLinkStatus } from "next/link";

import type { BrowseItem } from "@/lib/browse/items";
import { cn } from "@/lib/utils";
import { NewDot } from "@/components/ui/new-dot";
import { BrowsePreview } from "./browse-preview";

function BrowseCardPendingOverlay() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[10px] bg-black/35 opacity-0 transition-opacity duration-200",
        "delay-100",
        pending && "opacity-100",
      )}
    />
  );
}

type BrowseCardProps = {
  item: BrowseItem;
  index: number;
  eager?: boolean;
  className?: string;
  style?: React.CSSProperties;
  surface?: "canvas" | "pin";
  pinHeight?: number;
  paused?: boolean;
  /** Canvas: false for overscan (poster only). Grid: leave default + observeVisibility. */
  allowVideo?: boolean;
  observeVisibility?: boolean;
  playbackPriority?: number;
  onMediaAspect?: (ratio: number) => void;
};

/** Figma 82:3892 — titled preview card (title bar + media shell). */
export function BrowseCard({
  item,
  eager = false,
  className,
  style,
  surface = "canvas",
  pinHeight,
  paused = false,
  allowVideo = true,
  observeVisibility = false,
  playbackPriority,
  onMediaAspect,
}: BrowseCardProps) {
  const displayTitle = item.titleFa ?? item.title;
  const label = item.isNew ? `${displayTitle}، جدید` : displayTitle;

  return (
    <article
      className={cn(surface === "pin" ? "browse-pin" : "browse-canvas-card size-full", className)}
      style={style}
    >
      <div className="browse-chrome">
        <div className="browse-chrome-title" dir="rtl" lang="fa">
          <h3 className="inline-flex min-w-0 items-center gap-1.5 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-base font-normal leading-none tracking-normal text-white">
            {/* RTL: first child sits on the right — dot before the title */}
            {item.isNew ? <NewDot /> : null}
            <span className="truncate">{displayTitle}</span>
          </h3>
        </div>
        <div className="browse-chrome-media">
          <div
            className="browse-card browse-pin-media"
            style={pinHeight ? { height: pinHeight } : undefined}
          >
            <BrowsePreview
              poster={item.poster}
              fallbackPoster={item.fallbackPoster}
              video={item.video}
              eager={eager}
              paused={paused}
              allowVideo={allowVideo}
              observeVisibility={observeVisibility}
              playbackPriority={playbackPriority}
              onAspect={onMediaAspect}
            />
          </div>
        </div>
      </div>
      <Link
        href={`/docs/components/${item.slug}`}
        aria-label={label}
        draggable={false}
        className="browse-card-hit relative rounded-[10px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
        onClick={() => {
          try {
            window.sessionStorage.setItem("tarhak:open-sidebar-pinned", "0");
          } catch {
            // ignore
          }
        }}
      >
        <BrowseCardPendingOverlay />
      </Link>
    </article>
  );
}
