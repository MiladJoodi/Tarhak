"use client";

import { useEffect, useRef } from "react";

import HorizontalMenu from "@/registry/default/example/horizontal-menu";
import { cn } from "@/lib/utils";

/**
 * Docs/preview stage only — scales the full bar into the phone viewport.
 * Does not change the published HorizontalMenu component.
 */
export default function HorizontalMenuDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return;

    const fit = () => {
      content.style.transform = "none";
      const nav = content.querySelector<HTMLElement>('[aria-label="منوی افقی"]');
      if (!nav) return;

      const stageW = stage.clientWidth;
      // offsetWidth ignores transforms — natural pill width.
      const navW = nav.offsetWidth;
      if (stageW <= 0 || navW <= 0) return;

      const scale = Math.min(1, (stageW - 16) / navW);
      content.style.transformOrigin = "center center";
      content.style.transform = scale < 0.999 ? `scale(${scale})` : "none";
    };

    fit();
    void document.fonts?.ready?.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={stageRef}
      className={cn(
        "flex h-full w-full min-w-0 items-center justify-center",
        "overflow-x-hidden overflow-y-visible bg-background",
        "px-2 pb-28 pt-24",
        "md:px-8 md:pb-12 md:pt-28",
      )}
    >
      <div
        ref={contentRef}
        className="w-max shrink-0 will-change-transform [&_section]:!w-max [&_section]:!max-w-none [&_section]:!px-0"
      >
        <HorizontalMenu />
      </div>
    </div>
  );
}
