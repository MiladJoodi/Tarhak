"use client";

import * as React from "react";

import { PreviewHint } from "@/components/open/preview-hint";
import { Index } from "@/registry/__index__";
import type { ResolvedPreviewHint } from "@/lib/open/preview-hint-config";
import { cn } from "@/lib/utils";

export function OpenPreview({
  name,
  className,
  hintTop,
  hint,
  hintTone = "dark",
  theme = "dark",
}: {
  name: string;
  className?: string;
  hintTop?: number;
  hint?: ResolvedPreviewHint | null;
  hintTone?: "dark" | "light";
  theme?: "dark" | "light";
}) {
  const Component = Index[name]?.component as
    | React.ComponentType<{ size?: string; className?: string }>
    | undefined;
  // Tall sticky demos that scroll <main> must size to content, not the viewport.
  const fill = name !== "perspective-text-scroll";
  // This demo is its own scrollport (`overflow-y-auto` or iframe). min-h-0 stops the
  // 5×110vh track from inflating this grid item so <main> never becomes the scroller.
  const nestedPageScroll =
    name === "scroll-stack-deck" ||
    name === "stack-scroll-reveal" ||
    name === "scroll-split-cards";
  // Full-bleed pan canvases: pin to the preview box. items-center + % height collapses them.
  const fillBleed = name === "infinite-grid";
  // Expanding popovers (date field, filter morph) must not be clipped by the stage.
  const allowOverflow =
    name === "date-field" ||
    name === "filter-interaction" ||
    name === "nested-dropdown" ||
    name === "command-palette";

  const inner = Component ? (
    fillBleed ? (
      <div className="relative h-full min-h-0 w-full">
        <Component size="lg" className="absolute inset-0 size-full" />
      </div>
    ) : (
      <div
        className={cn(
          // items-center (not safe_center): Tailwind never emitted items-[safe_center],
          // so align-items stayed normal/stretch and short demos pinned to the top.
          "flex w-full min-w-0 items-center justify-center",
          // min-h-0: let h-full demos with overflow-auto become the scrollport
          // instead of inflating <main> and clipping under the overlay header.
          fill && "h-full min-h-0",
          nestedPageScroll && "min-h-0",
          allowOverflow && "overflow-visible",
        )}
      >
        <Component size="lg" />
      </div>
    )
  ) : (
    <p className="text-sm text-muted-foreground">This component has no live preview yet.</p>
  );

  return (
    <div
      className={cn(
        // no min-h-full: that overrides grid min-height:auto and clips tall sticky demos
        "component-showcase grid w-full min-w-0 text-foreground",
        theme === "dark" ? "dark" : "light",
        fill ? "h-full min-h-0" : "h-max",
        nestedPageScroll && "min-h-0",
        className,
      )}
      style={
        hintTop != null
          ? ({ "--preview-hint-top": `${hintTop}px` } as React.CSSProperties)
          : undefined
      }
    >
      {Component && hint ? (
        <PreviewHint
          heading={hint.heading}
          description={hint.description}
          tone={hintTone}
          hideOnScroll={hint.hideOnScroll}
          className={fill ? "h-full" : "h-auto"}
        >
          {inner}
        </PreviewHint>
      ) : (
        inner
      )}
    </div>
  );
}
