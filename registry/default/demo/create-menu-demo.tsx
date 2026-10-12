"use client";

import CreateMenu from "@/registry/default/example/create-menu";
import { cn } from "@/lib/utils";

/**
 * Docs/preview stage only — mobile centers the morphing menu without the
 * short 16/10 sidebar chrome. Does not change CreateMenu itself.
 */
export default function CreateMenuPreview() {
  return (
    <div
      className={cn(
        "flex h-full w-full min-w-0 items-center justify-center bg-background",
        "px-4",
        "md:px-8",
      )}
    >
      {/* Mobile: centered menu only — room to expand without pinning to the top */}
      <div
        dir="rtl"
        lang="fa"
        className="flex w-fit max-w-[min(100%,280px)] justify-center md:hidden [&>div]:justify-center"
      >
        <CreateMenu />
      </div>

      {/* Desktop: app chrome with sidebar */}
      <div
        dir="rtl"
        lang="fa"
        className="hidden aspect-[16/10] w-full max-w-[860px] overflow-visible rounded-2xl border border-border bg-muted/40 md:flex"
      >
        <div className="flex w-[240px] shrink-0 flex-col gap-3 border-e border-border bg-background p-3">
          <div className="mb-1 flex items-center gap-2 px-1">
            <div className="size-7 rounded-lg bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
          <CreateMenu />
          <div className="mt-1 space-y-2 px-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="size-4 rounded bg-muted" />
                <div
                  className="h-3 rounded bg-muted"
                  style={{ width: `${58 + (i % 3) * 12}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-auto space-y-2 px-1 pb-1">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-9 w-full rounded-lg bg-muted" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-5">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-8 w-8 rounded-md bg-muted" />
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted" />
            <div className="rounded-xl bg-muted" />
            <div className="col-span-2 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
