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
import { BRAND_NAME_FA } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function BrowseHeader({
  query,
  onQueryChange,
  stars,
  resultCount,
  totalCount,
  filtersActive = false,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  stars?: number | null;
  /** Filtered hit count while searching — shown next to the field. */
  resultCount?: number;
  totalCount?: number;
  /** When search narrows the list. */
  filtersActive?: boolean;
}) {
  const starCount = typeof stars === "number" ? formatStarCount(stars) : null;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);
  const hasQuery = query.trim().length > 0;
  const showHint = !focused && !hasQuery;
  const showCount =
    filtersActive &&
    typeof resultCount === "number" &&
    typeof totalCount === "number";

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

  return (
    <header
      dir="rtl"
      lang="fa"
      className={cn(
        "flex w-full shrink-0 items-center gap-2 px-3 py-2.5",
        "font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        "sm:gap-3 sm:px-[30px]",
      )}
    >
      <Link
        href="/"
        aria-label={`صفحهٔ اصلی ${BRAND_NAME_FA}`}
        className="inline-flex h-10 shrink-0 items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <BrandLogo invert wordmark={false} className="sm:hidden" />
        <BrandLogo invert className="hidden sm:inline-flex" />
      </Link>

      <div className="flex min-w-0 flex-1 items-center sm:justify-center">
        <div className="relative w-full min-w-0 sm:max-w-[min(100%,28rem)]">
          <label
            className={cn(
              "group relative flex h-10 w-full items-center gap-2 rounded-full px-3 sm:px-3.5",
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
              onBlur={() => setFocused(false)}
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
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/12 bg-white/5 text-white transition-[background-color,border-color] duration-150 hover:border-white/20 hover:bg-white/10 sm:w-auto sm:px-3"
            />
          }
        >
          <BrandStar className="size-[18px] text-[#C9A227]" />
          {starCount ? (
            <span
              dir="ltr"
              className="hidden text-[13px] leading-none font-medium tabular-nums sm:inline"
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
