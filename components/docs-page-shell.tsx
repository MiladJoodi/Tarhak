import type { ReactNode } from "react";
import {
  StickyAirplaneToc,
  type DocTocItem,
} from "@/components/docs/sticky-airplane-toc";
import { cn } from "@/lib/utils";

export function DocsPageShell({
  children,
  toc,
}: {
  children: ReactNode;
  toc?: DocTocItem[];
}) {
  const hasToc = Boolean(toc?.length);

  return (
    <div
      id="nd-docs-layout"
      className={cn(
        "relative mx-auto w-full px-4 py-8 sm:px-8 sm:py-12",
        hasToc &&
          "xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,42rem)_minmax(0,1fr)] xl:gap-x-10",
      )}
    >
      <main
        className={cn(
          "mx-auto min-w-0 w-full max-w-2xl pb-24",
          hasToc && "xl:col-start-2 xl:mx-0 xl:max-w-none",
        )}
      >
        {children}
      </main>

      {hasToc ? (
        <StickyAirplaneToc toc={toc!} className="xl:col-start-3" />
      ) : null}
    </div>
  );
}
