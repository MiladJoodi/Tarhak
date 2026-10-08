"use client";

import { DocsTableOfContents } from "@/components/mdx/table-of-content";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type DocTocItem = {
  title?: ReactNode;
  url: string;
  depth: number;
};

/** Right-rail TOC. Lives in the docs grid so it cannot overflow the viewport. */
export function StickyAirplaneToc({
  toc,
  className,
  top = "6rem",
}: {
  toc: DocTocItem[];
  className?: string;
  top?: string;
}) {
  if (!toc.length) return null;

  return (
    <aside
      className={cn("hidden min-w-0 max-w-72 self-start xl:sticky xl:block", className)}
      style={{ top }}
    >
      <DocsTableOfContents
        toc={toc}
        className="px-0 pt-0 [&_a]:text-white/45 [&_a[data-active=true]]:text-white [&_a:hover]:text-white [&_p]:bg-transparent [&_p]:text-white/45"
        indicatorClassName="text-white/35"
        indicatorActivePathColor="#c8d4ff"
        indicatorAirplaneFill="#e8eeff"
      />
    </aside>
  );
}
