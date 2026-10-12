"use client";

import * as React from "react";
import { Check, Terminal } from "lucide-react";

import { usePackageManager } from "@/components/open/use-package-manager";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGatedCopy } from "@/hooks/use-gated-copy";
import { cliInstallCommand } from "@/lib/open/package-manager";
import { cn } from "@/lib/utils";

/** Compact install copy — sits above the card hit layer; stops canvas pan. */
export function BrowseInstallButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const [manager] = usePackageManager();
  const [copied, setCopied] = React.useState(false);
  const gatedCopy = useGatedCopy({ componentSlug: slug, source: "cli" });
  const command = cliInstallCommand(manager, slug);

  const stop = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    stop(event);
    try {
      await gatedCopy(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={copied ? "کپی شد" : "کپی دستور نصب"}
        onPointerDown={stop}
        onClick={onCopy}
        className={cn(
          "browse-install-btn inline-flex size-7 shrink-0 items-center justify-center rounded-full",
          "bg-black/45 text-white/85 backdrop-blur-sm ring-1 ring-white/15",
          "transition-[background-color,color,transform] duration-150",
          "hover:bg-black/60 hover:text-white active:scale-95",
          className,
        )}
      >
        {copied ? (
          <Check className="size-3.5" strokeWidth={2.4} aria-hidden />
        ) : (
          <Terminal className="size-3.5" strokeWidth={2} aria-hidden />
        )}
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {copied ? "کپی شد" : "کپی دستور نصب"}
      </TooltipContent>
    </Tooltip>
  );
}
