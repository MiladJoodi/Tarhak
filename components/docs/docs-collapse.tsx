"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function DocsCollapse({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn(
        "group not-prose my-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]",
        className,
      )}
    >
      <CollapsibleTrigger
        dir="rtl"
        className="flex w-full items-center justify-start gap-2 px-3.5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/[0.04]"
      >
        <span>{title}</span>
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-white/45 transition-transform duration-200 group-data-[open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-white/10">
        <div className="prose prose-invert max-w-none px-3.5 py-3 text-[15px] leading-7 text-white/60 [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-white [&_ol]:my-3 [&_p]:mb-4 [&_pre]:my-0 [&_ul]:my-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
