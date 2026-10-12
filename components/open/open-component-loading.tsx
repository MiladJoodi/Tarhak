"use client";

import { usePreviewTheme } from "@/hooks/use-preview-theme";
import { cn } from "@/lib/utils";

/** Shown via `app/docs/components/[slug]/loading.tsx` while the RSC page streams. */
export function OpenComponentLoading() {
  const [previewTheme] = usePreviewTheme();

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-background",
        previewTheme === "dark" ? "dark" : "light",
      )}
      aria-busy="true"
      aria-label="در حال بارگذاری"
    >
      {/* Header + CLI bar stay in OpenExperience; avoid a fake dock that flashes on swap. */}
      <div className="flex flex-1 items-center justify-center px-6 pt-20 md:pt-0">
        <div
          className="h-[min(52vh,420px)] w-full max-w-3xl animate-pulse rounded-[28px] bg-muted"
          aria-hidden
        />
      </div>
    </div>
  );
}
