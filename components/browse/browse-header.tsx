"use client";

import * as React from "react";
import Link from "next/link";

import { SearchIcon } from "./icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatStarCount, GITHUB_URL } from "@/lib/github";
import { BrandLogo } from "@/components/brand-logo";
import { BrandStar } from "@/components/brand-star";

export function BrowseHeader({
  query,
  onQueryChange,
  stars,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  stars?: number | null;
}) {
  const starCount = typeof stars === "number" ? formatStarCount(stars) : null;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);

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
      className="flex w-full shrink-0 items-center justify-between px-[30px] py-2.5 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <Link
        href="/"
        aria-label="صفحهٔ اصلی طرحک"
        className="flex items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <BrandLogo invert />
      </Link>

      <div className="flex items-center gap-2.5">
        <div className="hidden w-[180px] items-center justify-between rounded-[12px] border border-white/10 bg-[#030202] px-3 py-2 transition-[border-color] duration-150 ease-out focus-within:border-white/20 md:flex sm:w-[243px]">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SearchIcon className="size-4 shrink-0 text-[#acacb4]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  onQueryChange("");
                  event.currentTarget.blur();
                }
              }}
              type="search"
              placeholder="جستجو"
              aria-label="جستجوی کامپوننت‌ها"
              dir="rtl"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#acacb4] outline-none placeholder:text-[#acacb4] [&::-webkit-search-cancel-button]:hidden"
            />
          </div>
          {focused || query ? null : (
            <kbd
              dir="ltr"
              className="relative flex shrink-0 items-center justify-center rounded-[6px] bg-[#212121] px-3 py-0.5 font-sans text-xs text-[#adadb7]"
            >
              /
            </kbd>
          )}
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
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-white transition-[background-color,border-color] duration-150 hover:border-white/20 hover:bg-white/10"
              />
            }
          >
            <BrandStar className="text-[#C9A227]" />
            {starCount ? (
              <span dir="ltr" className="text-[13px] leading-none font-medium tabular-nums">
                {starCount}
              </span>
            ) : null}
          </TooltipTrigger>
          <TooltipContent side="bottom">ستاره در گیت‌هاب</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
