"use client";

/* eslint-disable @next/next/no-img-element -- browse posters are remote stills. */

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronsUpDown, Search } from "lucide-react";

import { scrollbarMinimal, forgetScroller, rememberScroller, centerChildInScroller } from "@/components/open/ui";
import { browsePoster, SWITCHER_THUMB } from "@/lib/browse/media";
import { rankSearchItems } from "@/lib/component-tags";
import type { OpenNavItem } from "@/lib/open/component";
import { cn } from "@/lib/utils";

const TITLE_SUFFIX = " - طرحک";

const DROPDOWN_SHADOW =
  "shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55),0_4px_12px_-4px_rgba(0,0,0,0.35),0_0_0_1px_hsla(0,0%,100%,0.06)]";

function setDocumentTitle(title: string) {
  if (typeof document === "undefined") return;
  document.title = `${title}${TITLE_SUFFIX}`;
}

export function OpenSwitcher({
  current,
  items,
  variant = "floating",
}: {
  current: OpenNavItem;
  items: OpenNavItem[];
  /** `bar` = single-line title + chevron for the mobile strip header. */
  variant?: "floating" | "bar";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [instant, setInstant] = React.useState(false);
  const [pending, setPending] = React.useState<OpenNavItem | null>(null);

  const pathCurrent =
    items.find((item) => item.href === pathname) ??
    items.find((item) => item.slug === current.slug) ??
    current;
  const displayed = pending ?? pathCurrent;

  React.useEffect(() => {
    if (pending && pending.href === pathname) setPending(null);
  }, [pathname, pending]);

  const filtered = React.useMemo(() => {
    return rankSearchItems(items, query, (item) => ({
      name: `${item.titleFa ?? ""} ${item.title} ${item.slug}`,
      tags: item.tags,
    }));
  }, [items, query]);

  const close = React.useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Skip when this instance is CSS-hidden (mobile/desktop dual mount).
      if (!rootRef.current || rootRef.current.getClientRects().length === 0) return;
      const target = event.target as HTMLElement | null;
      const typingInField = target && /^(INPUT|TEXTAREA)$/.test(target.tagName);
      if (event.key === "/" && !typingInField) {
        event.preventDefault();
        setInstant(true);
        setOpen(true);
        return;
      }
      if (
        !open &&
        !typingInField &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        event.key.length === 1 &&
        /[\w-]/i.test(event.key)
      ) {
        setInstant(true);
        setOpen(true);
        setQuery(event.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  React.useLayoutEffect(() => {
    if (!open || query.trim()) return;
    const scroller = listRef.current;
    if (!scroller) return;

    const key = "switcher";
    let allow = true;
    const stop = () => {
      allow = false;
    };
    const active = () =>
      scroller.querySelector<HTMLElement>('[aria-selected="true"]');
    const run = () => {
      if (!allow) return;
      const item = active();
      if (item) centerChildInScroller(scroller, item);
    };

    forgetScroller(key);
    run();
    const until = performance.now() + 220;
    let raf = 0;
    const tick = () => {
      run();
      if (allow && performance.now() < until) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onScroll = () => rememberScroller(key, scroller);
    const ro = new ResizeObserver(() => run());
    ro.observe(scroller);
    const content = scroller.firstElementChild;
    if (content) ro.observe(content);
    const onLoad = () => run();
    const imgs = [...scroller.querySelectorAll("img")];
    for (const img of imgs) {
      if (!img.complete) img.addEventListener("load", onLoad);
    }
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("wheel", stop, { passive: true });
    scroller.addEventListener("touchmove", stop, { passive: true });
    return () => {
      rememberScroller(key, scroller);
      cancelAnimationFrame(raf);
      ro.disconnect();
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("wheel", stop);
      scroller.removeEventListener("touchmove", stop);
      for (const img of imgs) img.removeEventListener("load", onLoad);
    };
  }, [open, displayed.href, query, filtered]);

  function select(item: OpenNavItem) {
    if (listRef.current) rememberScroller("switcher", listRef.current);
    close();
    if (item.href === pathname || item.href === current.href) return;
    setPending(item);
    setDocumentTitle(item.titleFa ?? item.title);
    router.push(item.href, { scroll: false });
  }

  const triggerPrimary = displayed.titleFa ?? displayed.title;
  const bar = variant === "bar";

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex min-w-0 justify-center",
        bar && "w-full",
        open && "z-[999999999]",
      )}
    >
      <button
        type="button"
        className={cn(
          "group relative inline-flex cursor-pointer items-center overflow-hidden text-white outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
          bar
            ? cn(
                "h-9 max-w-full gap-1.5 rounded-xl border-0 bg-transparent px-2.5 text-[14px]",
                "active:bg-white/[0.08]",
              )
            : cn(
                "h-10 max-w-[min(46vw,240px)] gap-2 rounded-full border-0 pe-2.5 ps-3.5 text-[15px] tracking-[-0.2px]",
                "bg-[hsl(240_6%_18%)]",
                "transition-[background-color,box-shadow] duration-150",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(240_6%_22%)]",
                "active:bg-[hsl(240_6%_15%)]",
                "shadow-[0_1px_0_0_hsla(0,0%,100%,0.06)_inset,0_2px_6px_-2px_hsla(0,0%,0%,0.35),0_0_0_1px_hsla(0,0%,0%,0.35)]",
                open &&
                  "bg-[hsl(240_6%_22%)] shadow-[0_1px_0_0_hsla(0,0%,100%,0.08)_inset,0_4px_12px_-4px_hsla(0,0%,0%,0.45),0_0_0_1px_hsla(0,0%,100%,0.08)]",
              ),
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setInstant(false);
          setOpen((value) => !value);
        }}
      >
        {bar ? (
          <>
            <span
              className="min-w-0 truncate font-medium leading-none"
              dir={displayed.titleFa ? "rtl" : "ltr"}
              lang={displayed.titleFa ? "fa" : undefined}
              title={triggerPrimary}
            >
              {triggerPrimary}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-white/55 transition-transform duration-200",
                open && "rotate-180 text-white/80",
              )}
              aria-hidden
              strokeWidth={2}
            />
          </>
        ) : (
          <>
            <span className="relative flex min-w-0 flex-1 flex-col items-start justify-center overflow-hidden leading-[1.15]">
              <span
                className="block w-full truncate text-start font-medium"
                dir={displayed.titleFa ? "rtl" : "ltr"}
                lang={displayed.titleFa ? "fa" : undefined}
                title={triggerPrimary}
              >
                {triggerPrimary}
              </span>
              {displayed.titleFa ? (
                <span
                  dir="ltr"
                  className="mt-0.5 block w-full truncate text-start text-[11px] font-normal text-white/45"
                  title={displayed.title}
                >
                  {displayed.title}
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                "relative flex size-6 shrink-0 items-center justify-center rounded-full bg-white/6 text-white/70 transition-[background-color,color,transform] duration-200",
                "[@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-white/10 [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-white/90",
                open && "bg-white/10 text-white",
              )}
            >
              <ChevronsUpDown
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  open && "scale-90",
                )}
                aria-hidden
                strokeWidth={2}
              />
            </span>
          </>
        )}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="listbox"
            className={cn(
              "absolute top-[calc(100%+10px)] left-1/2 z-[999999999] flex w-[min(300px,82vw)] origin-top flex-col overflow-hidden rounded-2xl border-0 bg-[hsl(240_6%_12%)] text-popover-foreground",
              DROPDOWN_SHADOW,
            )}
            initial={instant ? false : { opacity: 0, transform: "translateX(-50%) scale(0.96)" }}
            animate={{ opacity: 1, transform: "translateX(-50%) scale(1)" }}
            exit={{ opacity: 0, transform: "translateX(-50%) scale(0.96)" }}
            transition={instant ? { duration: 0 } : { duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="hidden border-b border-white/6 p-2.5 md:block" dir="rtl" lang="fa">
              <div className="relative flex items-center gap-2 overflow-hidden rounded-xl bg-black/45 px-3 py-2 ring-1 ring-white/6">
                <Search className="size-3.5 shrink-0 text-white/40" aria-hidden strokeWidth={1.75} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="جستجو"
                  aria-label="جستجوی کامپوننت‌ها"
                  className="min-w-0 flex-1 bg-transparent text-sm tracking-normal text-white/85 outline-none placeholder:text-white/35"
                />
              </div>
            </div>
            <div
              ref={listRef}
              dir="rtl"
              lang="fa"
              className={cn(
                "scroll-fade m-0 flex max-h-[280px] flex-col gap-0.5 overflow-y-auto overscroll-contain p-1.5",
                scrollbarMinimal,
              )}
            >
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-white/40">موردی پیدا نشد.</p>
              ) : (
                filtered.map((item) => {
                  const active = item.href === displayed.href;
                  const poster = browsePoster(item.slug);
                  const primary = item.titleFa ?? item.title;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "relative z-10 flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-sm text-white/80 outline-none",
                        "transition-[background-color,color] duration-150",
                        "focus-visible:outline-none focus-visible:ring-0",
                        active
                          ? cn(
                              "bg-white/10 text-white",
                              "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/12",
                              "active:bg-white/8",
                              "focus-visible:bg-white/12",
                            )
                          : cn(
                              "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/6 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white",
                              "active:bg-white/4",
                              "focus-visible:bg-white/6",
                            ),
                      )}
                      onMouseEnter={() => router.prefetch(item.href)}
                      onFocus={() => router.prefetch(item.href)}
                      onClick={() => select(item)}
                    >
                      {poster ? (
                        <span
                          className="relative shrink-0 overflow-hidden rounded-md ring-1 ring-white/12 bg-muted"
                          style={{ width: SWITCHER_THUMB.w, height: SWITCHER_THUMB.h }}
                        >
                          <img
                            src={poster}
                            alt=""
                            width={SWITCHER_THUMB.w}
                            height={SWITCHER_THUMB.h}
                            className="size-full object-cover"
                            draggable={false}
                          />
                        </span>
                      ) : null}
                      <span className="flex min-w-0 flex-1 flex-col items-start overflow-hidden leading-[1.15]">
                        <span
                          className="block w-full truncate font-medium"
                          dir={item.titleFa ? "rtl" : "ltr"}
                          lang={item.titleFa ? "fa" : undefined}
                          title={primary}
                        >
                          {primary}
                        </span>
                        {item.titleFa ? (
                          <span
                            dir="ltr"
                            className="mt-0.5 block w-full truncate text-[11px] text-white/40"
                            title={item.title}
                          >
                            {item.title}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
