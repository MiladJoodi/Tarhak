"use client";

import Link from "next/link";
import { Code2, Moon, Pencil, Sun } from "lucide-react";

import { useOpenPanel, type PreviewTheme } from "@/components/open/open-panel-context";
import { openPressMotion } from "@/components/open/ui";
import { cn } from "@/lib/utils";

export type OpenPanel = "code" | null;

const toolBtn = cn(
  "relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-0",
  "text-white/88 outline-none transition-[background-color,color,transform] duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.12] [@media(hover:hover)_and_(pointer:fine)]:hover:text-white",
  "active:bg-white/[0.08]",
  "disabled:cursor-not-allowed disabled:opacity-40",
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
      className={toolBtn}
    >
      {theme === "dark" ? (
        <Sun className="size-[17px]" strokeWidth={1.75} />
      ) : (
        <Moon className="size-[17px]" strokeWidth={1.75} />
      )}
    </button>
  );
}

/** Top-left preview tools — glass cluster, no accent fill. */
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
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-2xl p-1",
        "border border-white/12 bg-[hsla(240,8%,8%,0.55)] text-white",
        "shadow-[inset_0_1px_0_0_hsla(0,0%,100%,0.08),0_8px_24px_-12px_hsla(0,0%,0%,0.45)]",
        "backdrop-blur-xl backdrop-saturate-150",
      )}
    >
      <PreviewThemeToggle theme={previewTheme} onChange={setPreviewTheme} />
      {process.env.NODE_ENV === "development" ? (
        <Link href={`/admin/${slug}`} className={toolBtn} aria-label="ویرایش">
          <Pencil className="size-[16px]" strokeWidth={1.75} />
        </Link>
      ) : null}
      <button
        type="button"
        className={cn(toolBtn, active && "bg-white/[0.16] text-white")}
        aria-label={active ? "بستن کد" : "مشاهده کد"}
        aria-pressed={active}
        onClick={() => {
          onChange(active ? null : "code");
        }}
      >
        <Code2 className="size-[17px]" strokeWidth={1.75} />
      </button>
    </div>
  );
}
