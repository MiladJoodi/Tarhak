"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { SearchIcon } from "./icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatStarCount, GITHUB_URL } from "@/lib/github";
import { BrandLogo } from "@/components/brand-logo";
import { BrandStar } from "@/components/brand-star";
import { cn } from "@/lib/utils";

/** High-traffic picks shown when the field is focused and empty. */
const POPULAR_SEARCHES = [
  { label: "تب‌های متحرک", query: "تب‌های متحرک" },
  { label: "منوی کشویی تو‌در‌تو", query: "منوی کشویی" },
  { label: "سوئیچ‌های انیمیشنی", query: "سوئیچ" },
  { label: "دراپ‌زون آپلود", query: "آپلود" },
  { label: "لیست مرتب‌سازی", query: "مرتب‌سازی" },
] as const;

export function BrowseHeader({
  query,
  onQueryChange,
  stars,
  resultCount,
  totalCount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  stars?: number | null;
  /** Filtered hit count while searching — shown next to the field. */
  resultCount?: number;
  totalCount?: number;
}) {
  const starCount = typeof stars === "number" ? formatStarCount(stars) : null;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);
  const hasQuery = query.trim().length > 0;
  const showHint = !focused && !hasQuery;
  const showPopular = focused && !hasQuery;
  const showCount =
    hasQuery && typeof resultCount === "number" && typeof totalCount === "number";

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!showPopular) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setFocused(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [showPopular]);

  return (
    <header
      dir="rtl"
      lang="fa"
      className="flex w-full shrink-0 items-center gap-2.5 px-3 py-2.5 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal sm:gap-3 sm:px-[30px]"
    >
      <Link
        href="/"
        aria-label="صفحهٔ اصلی طرحک"
        className="flex shrink-0 items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <BrandLogo invert wordmark={false} className="sm:hidden" />
        <BrandLogo invert className="hidden sm:inline-flex" />
      </Link>

      <div className="flex min-w-0 flex-1 justify-center">
        <div
          ref={rootRef}
          className="relative w-full max-w-[min(100%,28rem)]"
        >
          <label
            className={cn(
              "group relative z-20 flex h-10 w-full items-center gap-2 rounded-full px-3.5",
              "bg-white/[0.07] ring-1 ring-white/14",
              "transition-[background-color,box-shadow,ring-color] duration-150",
              "hover:bg-white/10 hover:ring-white/22",
              focused &&
                "bg-white/12 ring-white/35 shadow-[0_0_0_3px_rgba(255,255,255,0.06)]",
            )}
          >
            <SearchIcon
              className={cn(
                "size-[17px] shrink-0 transition-colors duration-150",
                focused || hasQuery ? "text-white/85" : "text-white/50",
              )}
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  if (hasQuery) onQueryChange("");
                  else {
                    setFocused(false);
                    event.currentTarget.blur();
                  }
                }
              }}
              type="search"
              placeholder="جستجوی کامپوننت‌ها…"
              aria-label="جستجوی کامپوننت‌ها"
              aria-expanded={showPopular}
              aria-controls="browse-search-suggestions"
              dir="rtl"
              className={cn(
                "min-w-0 flex-1 bg-transparent text-[14px] leading-none outline-none",
                "text-white placeholder:text-white/40",
                "[&::-webkit-search-cancel-button]:hidden",
              )}
            />
            {showCount ? (
              <span
                dir="ltr"
                className="hidden shrink-0 tabular-nums text-[11px] text-white/45 sm:inline"
                aria-live="polite"
              >
                {resultCount}/{totalCount}
              </span>
            ) : null}
            {hasQuery ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onQueryChange("");
                  inputRef.current?.focus();
                }}
                aria-label="پاک کردن جستجو"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/16 hover:text-white"
              >
                <X className="size-3.5" strokeWidth={2.25} aria-hidden />
              </button>
            ) : showHint ? (
              <kbd
                dir="ltr"
                className="hidden shrink-0 items-center justify-center rounded-md bg-white/10 px-2 py-0.5 font-sans text-[11px] font-medium text-white/45 sm:inline-flex"
              >
                /
              </kbd>
            ) : null}
          </label>

          {showPopular ? (
            <div
              id="browse-search-suggestions"
              role="listbox"
              aria-label="جستجوهای پرتکرار"
              className={cn(
                "absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl",
                "border border-white/10 bg-[#141418]/95 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md",
              )}
            >
              <p className="px-3.5 pt-3 pb-1.5 text-[11px] font-medium text-white/40">
                پرتکرار
              </p>
              <ul className="flex flex-col gap-0.5 p-1.5 pt-0">
                {POPULAR_SEARCHES.map((item) => (
                  <li key={item.query} role="option">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onQueryChange(item.query);
                        inputRef.current?.focus();
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start",
                        "text-[13px] text-white/80 transition-colors",
                        "hover:bg-white/8 hover:text-white active:bg-white/6",
                      )}
                    >
                      <SearchIcon className="size-3.5 shrink-0 text-white/35" />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <Tooltip>
        <TooltipTrigger
          render={
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={
                starCount
                  ? `Tarhak در گیت‌هاب، ${starCount} ستاره`
                  : "Tarhak در گیت‌هاب"
              }
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-2.5 py-1.5 text-white transition-[background-color,border-color] duration-150 hover:border-white/20 hover:bg-white/10 sm:px-3"
            />
          }
        >
          <BrandStar className="text-[#C9A227]" />
          {starCount ? (
            <span
              dir="ltr"
              className="text-[13px] leading-none font-medium tabular-nums"
            >
              {starCount}
            </span>
          ) : null}
        </TooltipTrigger>
        <TooltipContent side="bottom">ستاره در گیت‌هاب</TooltipContent>
      </Tooltip>
    </header>
  );
}
