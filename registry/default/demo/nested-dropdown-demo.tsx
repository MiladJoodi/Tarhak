"use client";

import { useEffect, useRef } from "react";

import NestedDropdown from "@/registry/default/example/nested-dropdown";
import { cn } from "@/lib/utils";

/** Open panel is `w-80`; root menu ~441px tall. Docs stage only. */
const OPEN_W = 320;
const OPEN_H = 441;
/** Comfortable mobile preview width — keeps the text-xl shell compact. */
const MOBILE_PREVIEW_W = 200;

/**
 * Docs/preview stage only — scales the open shell into the phone viewport
 * and pins the trigger at end (visual left in RTL) so the morph stays
 * in-frame. Does not change NestedDropdown.
 */
export default function NestedDropdownDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return;

    const fit = () => {
      content.style.transform = "none";
      const stageW = stage.clientWidth;
      const stageH = stage.clientHeight;
      if (stageW <= 0 || stageH <= 0) return;

      // Cap mobile preview so the text-xl shell doesn't dominate the stage.
      const targetW =
        stageW < 640 ? Math.min(OPEN_W, stageW - 56, MOBILE_PREVIEW_W) : OPEN_W;
      const targetH =
        stageW < 640 ? Math.min(OPEN_H, stageH - 96, 310) : OPEN_H;
      const scale = Math.min(1, targetW / OPEN_W, targetH / OPEN_H);
      content.style.transformOrigin = "center center";
      content.style.transform = scale < 0.999 ? `scale(${scale})` : "none";
    };

    fit();
    void document.fonts?.ready?.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={stageRef}
      className={cn(
        "flex h-full w-full min-w-0 items-center justify-center bg-background",
        "overflow-hidden",
        "px-2",
        "md:overflow-visible md:px-8",
      )}
    >
      <div ref={contentRef} className="will-change-transform">
        <div
          dir="rtl"
          lang="fa"
          className="relative"
          style={{ width: OPEN_W, height: OPEN_H }}
        >
          <div className="absolute top-0 end-0">
            <NestedDropdown />
          </div>
        </div>
      </div>
    </div>
  );
}
