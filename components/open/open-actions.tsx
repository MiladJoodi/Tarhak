"use client";

/* eslint-disable @next/next/no-img-element -- Figma-exported marks. */

import Link from "next/link";
import { Pencil } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

import { useOpenPanel, type PreviewTheme } from "@/components/open/open-panel-context";
import { openPressMotion } from "@/components/open/ui";
import { cn } from "@/lib/utils";

export type OpenPanel = "code" | null;

const actionBtnClass = cn(
  "inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-0 p-2.5 text-white",
  "bg-[hsl(230_77%_55%)]",
  "shadow-[inset_0_1px_0_0.2px_hsla(0,0%,100%,0.16),0_2px_2px_-1px_hsla(0,0%,0%,0.16),0_4px_4px_-2px_hsla(0,0%,0%,0.24),0_0_0_1px_hsla(0,0%,0%,0.12)]",
  "outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
  "transition-[transform,background-color,box-shadow] duration-150",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(230_77%_58%)]",
  "active:bg-[hsl(230_77%_55%)]",
  openPressMotion,
);

function PreviewThemeToggle({
  theme,
  onChange,
}: {
  theme: PreviewTheme;
  onChange: (theme: PreviewTheme) => void;
}) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      aria-label={next === "light" ? "تم روشن" : "تم تیره"}
      onClick={() => onChange(next)}
      className={cn(
        // Solid chrome so the control stays visible on light preview canvases.
        "relative inline-flex size-11 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-0 text-white",
        "bg-[hsl(240_6%_22%)]",
        "shadow-[0_2px_2px_-1px_hsla(0,0%,0%,0.16),0_4px_4px_-2px_hsla(0,0%,0%,0.14),0_0_0_1px_hsla(0,0%,0%,0.1)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]",
        "before:bg-[linear-gradient(180deg,transparent_30%,hsla(0,0%,0%,0.07)_100%)]",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
        "after:shadow-[inset_0_1px_0.5px_0_hsla(0,0%,100%,0.05)]",
        "transition-[background-color,transform] duration-150",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(240_6%_25%)]",
        "active:bg-[hsl(240_6%_19%)]",
        openPressMotion,
      )}
    >
      <HugeiconsIcon
        icon={theme === "dark" ? Sun03Icon : Moon02Icon}
        size={20}
        strokeWidth={1.8}
        className="relative z-[1] size-5"
      />
    </button>
  );
}

/** Figma 91:4635 — primary code button; hover only bumps lightness ~2–4. */
export function OpenActions({
  panel,
  onChange,
  slug,
}: {
  panel: OpenPanel;
  onChange: (panel: OpenPanel) => void;
  slug: string;
}) {
  const active = panel === "code";
  const { previewTheme, setPreviewTheme } = useOpenPanel();

  return (
    <div className="flex items-center gap-2">
      <PreviewThemeToggle theme={previewTheme} onChange={setPreviewTheme} />
      {process.env.NODE_ENV === "development" ? (
        <Link href={`/admin/${slug}`} className={actionBtnClass} aria-label="Edit">
          <Pencil className="size-[22px]" />
        </Link>
      ) : null}
      <button
        type="button"
        className={actionBtnClass}
        aria-label="Code"
        aria-pressed={active}
        onClick={() => {
          onChange(active ? null : "code");
        }}
      >
        <img src="/open/code.svg" alt="" width={22} height={22} className="size-[22px]" draggable={false} />
      </button>
    </div>
  );
}
