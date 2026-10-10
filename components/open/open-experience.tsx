"use client";

/* eslint-disable @next/next/no-img-element -- static Figma marks. */

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Menu, Search, X } from "lucide-react";

import { LineNav } from "@/components/line-nav";
import { OpenActions } from "@/components/open/open-actions";
import { OpenPanelProvider, useOpenPanel } from "@/components/open/open-panel-context";
import { OpenSwitcher } from "@/components/open/open-switcher";
import {
  SidebarHoverPreview,
  PREVIEW_W,
  type SidebarHoverTarget,
} from "@/components/open/sidebar-hover-preview";
import {
  openIconBtn,
  openPressMotion,
  scrollbarNone,
  forgetScroller,
  rememberScroller,
  restoreScroller,
  centerChildInScroller,
} from "@/components/open/ui";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { rankSearchItems } from "@/lib/component-tags";
import type { OpenNavItem } from "@/lib/open/component";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

const SIDEBAR_WIDTH = 262;
const PINNED_KEY = "tarhak:open-sidebar-pinned";
const SCROLL_EDGE_EPS = 1;

function readPinned() {
  // Desktop default: open. Only stay closed if the user explicitly unpinned.
  if (typeof window === "undefined") return true;
  try {
    const stored = window.sessionStorage.getItem(PINNED_KEY);
    if (stored === null) return true;
    return stored === "1";
  } catch {
    return true;
  }
}

function writePinned(value: boolean) {
  try {
    window.sessionStorage.setItem(PINNED_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

/** Figma 102:6 — same glyph for default + hover; never swap on peek. */
function SidebarToggleIcon() {
  return (
    <img
      src="/open/sidebar.svg"
      alt=""
      width={18}
      height={18}
      className="size-[18px] opacity-90"
      draggable={false}
    />
  );
}

function PinnedSidebarHeader({ onClose }: { onClose: () => void }) {
  return (
    <header
      lang="fa"
      dir="rtl"
      className={cn(
        "flex w-full shrink-0 items-center justify-between gap-3 overflow-hidden rounded-b-[16px] bg-[hsl(240_5%_4%)] px-3.5 py-[15px]",
        "shadow-[0_1px_0_0_hsla(0,0%,100%,0.02),0_6px_16px_-14px_hsla(0,0%,0%,0.06),0_4px_8px_-12px_hsla(0,0%,0%,0.08),0_2px_6px_-10px_hsla(0,0%,0%,0.1)]",
      )}
    >
      <Link
        href="/browse"
        className="flex min-w-0 items-center outline-none focus-visible:ring-0"
        aria-label="طرحک — مرور کامپوننت‌ها"
      >
        <BrandLogo invert />
      </Link>
      <button
        type="button"
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center overflow-hidden rounded-xl border-0 bg-transparent p-1",
          "outline-none ring-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0",
          "shadow-[0_4px_2px_hsla(0,0%,0%,0.24),0_0_0_1px_hsla(0,0%,0%,0.1)]",
          "hover:bg-transparent",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:[&_img]:brightness-0",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:[&_img]:invert",
          openPressMotion,
        )}
        aria-label="بستن سایدبار"
        aria-pressed="true"
        onClick={onClose}
      >
        <span className="inline-flex">
          <img
            src="/open/sidebar-close.svg"
            alt=""
            width={18}
            height={18}
            className="size-[18px] transition-[filter] duration-150"
            draggable={false}
          />
        </span>
      </button>
    </header>
  );
}

function SidebarList({
  items,
  activeHref,
  tall = false,
  surface = "card",
  onItemHover,
}: {
  items: OpenNavItem[];
  activeHref: string;
  tall?: boolean;
  /** Scroll fade base — peek floating card vs pinned dock column */
  surface?: "card" | "background" | "sidebar";
  onItemHover?: (
    item: OpenNavItem | null,
    anchor: HTMLAnchorElement | null,
  ) => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const centeredOnOpenRef = React.useRef(false);
  const [query, setQuery] = React.useState("");
  const [showTop, setShowTop] = React.useState(false);
  const [showBottom, setShowBottom] = React.useState(false);

  const filtered = React.useMemo(
    () =>
      rankSearchItems(items, query, (item) => ({
        name: `${item.titleFa ?? ""} ${item.title} ${item.slug}`,
        tags: item.tags,
      })),
    [items, query],
  );

  // Match panel bg exactly — pinned dock hsl(240 6% 7%), floating card hsl(240 6% 20%)
  const fadeFrom =
    surface === "sidebar" || surface === "background"
      ? "from-[hsl(240_6%_7%)]"
      : "from-[hsl(240_6%_20%)]";

  // Reset so the next open can center once; browsing while open must not.
  React.useEffect(() => {
    return () => {
      centeredOnOpenRef.current = false;
      forgetScroller("sidebar");
    };
  }, []);

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const key = "sidebar";
    let allow = true;
    const stop = () => {
      allow = false;
    };
    const active = () => el.querySelector<HTMLElement>("[aria-current=page]");
    const updateFades = () => {
      const { scrollTop, clientHeight, scrollHeight } = el;
      setShowTop(scrollTop > 0);
      setShowBottom(scrollTop + clientHeight < scrollHeight - SCROLL_EDGE_EPS);
    };
    const place = (mode: "center" | "keep") => {
      if (!allow || el.clientHeight === 0) return;
      const item = active();
      if (item) {
        if (mode === "center") {
          centerChildInScroller(el, item);
          rememberScroller(key, el);
          centeredOnOpenRef.current = true;
        } else {
          restoreScroller(key, el, item);
        }
      }
      updateFades();
    };

    // Center only the first time this sidebar instance opens.
    // Later clicks keep scroll and only reveal if the row is clipped.
    place(centeredOnOpenRef.current ? "keep" : "center");
    const until = performance.now() + 220;
    let raf = 0;
    const tick = () => {
      place(centeredOnOpenRef.current ? "keep" : "center");
      if (allow && performance.now() < until) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onScroll = () => {
      rememberScroller(key, el);
      updateFades();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("touchmove", stop, { passive: true });
    const ro = new ResizeObserver(() => place("keep"));
    ro.observe(el);
    const child = el.firstElementChild;
    if (child) ro.observe(child);
    return () => {
      rememberScroller(key, el);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchmove", stop);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [filtered, activeHref]);

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col",
        tall && "h-[min(70dvh,560px)]",
      )}
    >
      <div
        className="shrink-0 px-3 pt-2.5 pb-1.5"
        dir="rtl"
        lang="fa"
      >
        <label className="relative flex items-center gap-2 overflow-hidden rounded-xl bg-black/45 px-3 py-2 ring-1 ring-white/6">
          <Search
            className="size-3.5 shrink-0 text-white/40"
            aria-hidden
            strokeWidth={1.75}
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو"
            aria-label="جستجوی کامپوننت‌ها"
            className="min-w-0 flex-1 bg-transparent text-sm tracking-normal text-white/85 outline-none placeholder:text-white/35"
          />
          {query ? (
            <button
              type="button"
              aria-label="پاک کردن جستجو"
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/8 hover:text-white/80"
              onClick={() => setQuery("")}
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          ) : null}
        </label>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-[2] h-12 bg-linear-to-b to-transparent transition-opacity duration-150",
            fadeFrom,
            showTop ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={!showTop}
        />
        <div
          ref={scrollRef}
          className={cn("h-full overflow-auto pt-1 pr-2.5 pb-8 pl-3.5", scrollbarNone)}
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-white/40">
              موردی پیدا نشد.
            </p>
          ) : (
            <LineNav
              className="py-2"
              items={filtered}
              activeHref={activeHref}
              onItemClick={(item) => {
                if (scrollRef.current) {
                  rememberScroller("sidebar", scrollRef.current);
                }
                document.title = `${item.title} - طرحک`;
              }}
              onItemHover={
                onItemHover
                  ? (item, anchor) => {
                      if (!item || !anchor) {
                        onItemHover(null, null);
                        return;
                      }
                      const match =
                        items.find((entry) => entry.href === item.href) ?? null;
                      onItemHover(match, anchor);
                    }
                  : undefined
              }
            />
          )}
        </div>
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-12 bg-linear-to-t to-transparent transition-opacity duration-150",
            fadeFrom,
            showBottom ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={!showBottom}
        />
      </div>
    </div>
  );
}

/** Figma 102:444 — floating sidebar chrome */
const sidebarShell =
  "overflow-hidden rounded-[14px] border-0 bg-[hsl(240_6%_20%)] text-foreground shadow-[0_6px_10px_-30px_rgba(0,0,0,0.04),0_4px_6px_-10px_rgba(0,0,0,0.25),0_2px_4px_-10px_rgba(0,0,0,0.25)] origin-top-right";

function BrowseLink({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const mobile = variant === "mobile";
  return (
    <Link
      href="/browse"
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center border-0 text-white outline-none",
        "transition-[background-color,color,transform] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
        openPressMotion,
        mobile
          ? cn(
              "h-9 rounded-[10px] px-2 text-xs font-medium tracking-normal text-white/88",
              "active:bg-white/10",
              "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/12 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white",
            )
          : cn(
              "h-10 rounded-full bg-[hsl(240_6%_18%)] px-3.5 text-xs font-medium tracking-normal",
              "shadow-[0_1px_0_0_hsla(0,0%,100%,0.06)_inset,0_2px_6px_-2px_hsla(0,0%,0%,0.35),0_0_0_1px_hsla(0,0%,0%,0.35)]",
              "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(240_6%_22%)]",
              "active:bg-[hsl(240_6%_15%)]",
            ),
      )}
    >
      کامپوننت‌ها
    </Link>
  );
}

export function OpenExperience({
  navItems,
  children,
}: {
  navItems: OpenNavItem[];
  children: React.ReactNode;
}) {
  return (
    <OpenPanelProvider>
      <OpenExperienceShell navItems={navItems}>{children}</OpenExperienceShell>
    </OpenPanelProvider>
  );
}

function OpenExperienceShell({
  navItems,
  children,
}: {
  navItems: OpenNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { panel, setPanel, stage, setStage } = useOpenPanel();
  const isMobile = useIsMobile();
  const [pinned, setPinned] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [peek, setPeek] = React.useState(false);
  const [hoverPreview, setHoverPreview] = React.useState<SidebarHoverTarget | null>(null);
  const peekPanelRef = React.useRef<HTMLDivElement>(null);
  /** After unpin, ignore toggle hover briefly so the menu does not flash open under the cursor. */
  const suppressPeekRef = React.useRef(false);
  const suppressPeekTimerRef = React.useRef<number | null>(null);
  const reduce = useReducedMotion();

  const armPeekSuppress = React.useCallback(() => {
    suppressPeekRef.current = true;
    setPeek(false);
    setHoverPreview(null);
    if (suppressPeekTimerRef.current != null) {
      window.clearTimeout(suppressPeekTimerRef.current);
    }
    suppressPeekTimerRef.current = window.setTimeout(() => {
      suppressPeekRef.current = false;
      suppressPeekTimerRef.current = null;
    }, 420);
  }, []);

  React.useEffect(() => {
    return () => {
      if (suppressPeekTimerRef.current != null) {
        window.clearTimeout(suppressPeekTimerRef.current);
      }
    };
  }, []);

  const slug = pathname.split("/").pop() ?? "";
  const current =
    navItems.find((item) => item.href === pathname) ??
    navItems.find((item) => item.slug === slug) ??
    navItems[0] ?? {
      slug: "component",
      title: "Component",
      href: pathname,
    };

  React.useLayoutEffect(() => {
    setPinned(readPinned());
  }, []);

  React.useEffect(() => {
    setDocumentTitle(current.title);
  }, [current.title]);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (isMobile) {
      setPeek(false);
      setHoverPreview(null);
    }
  }, [isMobile]);

  React.useEffect(() => {
    if (!stage) return;
    setPeek(false);
    setHoverPreview(null);
    setMobileOpen(false);
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setStage(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, setStage]);

  function updatePinned(value: boolean) {
    setPinned(value);
    writePinned(value);
  }

  const sidebarMotion = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, transform: "translateX(8px) scale(0.98)" },
        animate: { opacity: 1, transform: "translateX(0px) scale(1)" },
        exit: { opacity: 0, transform: "translateX(8px) scale(0.98)" },
      };

  const pinnedSidebarMotion = reduce
    ? {
        initial: { width: 0, opacity: 0 },
        animate: { width: SIDEBAR_WIDTH, opacity: 1 },
        exit: { width: 0, opacity: 0 },
      }
    : {
        initial: { width: 0, opacity: 0.6 },
        animate: { width: SIDEBAR_WIDTH, opacity: 1 },
        exit: { width: 0, opacity: 0.6 },
      };

  // `isMobile === false` (not !isMobile): unknown viewport must not paint desktop chrome.
  const showDesktopPinned = pinned && isMobile === false && !stage;
  const showToggle = !stage && !showDesktopPinned;

  return (
    <div className="dark flex h-dvh overflow-hidden bg-[hsl(240_6%_7%)] text-foreground">
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[hsl(225_7%_11%)]">
        {/* Desktop: floating sidebar peek control (mobile uses hamburger in the strip). */}
        {showToggle ? (
          <div
            className={cn(
              // Above the desktop chrome header (z-100) so the control stays clickable.
              "pointer-events-none absolute top-[18px] right-[18px] z-[110] max-md:hidden",
            )}
            onMouseEnter={() => {
              if (isMobile !== false || suppressPeekRef.current) return;
              setPeek(true);
            }}
            onMouseLeave={() => {
              if (isMobile !== false) return;
              suppressPeekRef.current = false;
              if (suppressPeekTimerRef.current != null) {
                window.clearTimeout(suppressPeekTimerRef.current);
                suppressPeekTimerRef.current = null;
              }
              setPeek(false);
              setHoverPreview(null);
            }}
          >
            <button
              type="button"
              className={cn(openIconBtn, "pointer-events-auto cursor-pointer")}
              data-active={peek ? "true" : undefined}
              aria-label={peek ? "سنجاق کردن سایدبار" : "باز کردن سایدبار"}
              aria-expanded={peek}
              aria-pressed={false}
              onClick={() => {
                updatePinned(true);
                setPeek(false);
                setHoverPreview(null);
              }}
            >
              <SidebarToggleIcon />
            </button>
            <AnimatePresence>
              {peek && isMobile === false ? (
                <motion.div
                  ref={peekPanelRef}
                  className="pointer-events-auto absolute top-11 right-0 z-[110] before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']"
                  style={{ width: SIDEBAR_WIDTH + 8 + PREVIEW_W }}
                  initial={sidebarMotion.initial}
                  animate={sidebarMotion.animate}
                  exit={sidebarMotion.exit}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div
                    className={cn(sidebarShell, "ms-auto max-h-[min(70dvh,560px)]")}
                    style={{ width: SIDEBAR_WIDTH }}
                  >
                    <SidebarList
                      items={navItems}
                      activeHref={current.href}
                      tall
                      surface="card"
                      onItemHover={(item, anchor) => {
                        if (!item || !anchor || !peekPanelRef.current) {
                          setHoverPreview(null);
                          return;
                        }
                        const panelBox = peekPanelRef.current.getBoundingClientRect();
                        const rowBox = anchor.getBoundingClientRect();
                        setHoverPreview({
                          slug: item.slug,
                          title: item.title,
                          rowMid: rowBox.top + rowBox.height / 2 - panelBox.top,
                          panelHeight: panelBox.height,
                        });
                      }}
                    />
                  </div>
                  <SidebarHoverPreview target={hoverPreview} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}

        {/* Above preview layers that escape stacking (e.g. magnified-bento lens z-40). Drawer portal is z-[110] so it covers this chrome. */}
        {stage ? null : (
          <>
            <header
              dir="rtl"
              lang="fa"
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 z-[100] flex h-14 items-center gap-1 px-2 *:pointer-events-auto md:hidden",
                "border-b border-white/8 bg-[hsla(240,8%,7%,0.72)]",
                "shadow-[inset_0_-1px_0_0_hsla(0,0%,100%,0.04)]",
                "backdrop-blur-xl backdrop-saturate-150",
              )}
            >
              <button
                type="button"
                className={cn(
                  "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-0 text-white/88",
                  "outline-none transition-[background-color,color,transform] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
                  "active:bg-white/[0.1]",
                  openPressMotion,
                )}
                aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                {mobileOpen ? (
                  <X className="size-[18px]" strokeWidth={1.85} />
                ) : (
                  <Menu className="size-[18px]" strokeWidth={1.85} />
                )}
              </button>

              <BrowseLink variant="mobile" />

              <div className="flex min-w-0 flex-1 items-center justify-center">
                <OpenSwitcher current={current} items={navItems} variant="bar" />
              </div>

              <OpenActions
                panel={panel}
                onChange={setPanel}
                slug={current.slug}
                variant="bar"
              />
            </header>

            <header className="pointer-events-none absolute inset-x-[18px] top-[18px] z-[100] hidden grid-cols-[1fr_auto_1fr] items-start gap-4 *:pointer-events-auto md:grid">
              <div className="justify-self-start">
                <OpenActions panel={panel} onChange={setPanel} slug={current.slug} />
              </div>
              <div className="flex items-center justify-center justify-self-center">
                {showToggle ? (
                  <OpenSwitcher current={current} items={navItems} />
                ) : null}
              </div>
              <div className="pointer-events-none flex items-center justify-self-end">
                <span
                  className={cn(
                    "pointer-events-auto",
                    showToggle && "me-14",
                  )}
                >
                  <BrowseLink variant="desktop" />
                </span>
              </div>
            </header>
          </>
        )}

        {children}
      </div>

      {/* Mobile: partial-width right sheet */}
      <Sheet open={isMobile === true && mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="dark flex h-full max-w-[min(262px,85vw)] flex-col gap-0 border-l-0 bg-[hsl(240_6%_7%)] p-0 text-foreground sm:max-w-[262px]"
          style={{ width: `min(${SIDEBAR_WIDTH}px, 85vw)` }}
        >
          <PinnedSidebarHeader onClose={() => setMobileOpen(false)} />
          <SidebarList items={navItems} activeHref={current.href} surface="background" />
        </SheetContent>
      </Sheet>

      <AnimatePresence initial={false}>
        {showDesktopPinned ? (
          <motion.aside
            key="pinned-sidebar"
            className="sticky top-0 bottom-0 z-24 flex h-dvh shrink-0 flex-col items-center overflow-hidden bg-[hsl(240_6%_7%)] text-foreground"
            data-sidebar="pinned"
            initial={pinnedSidebarMotion.initial}
            animate={pinnedSidebarMotion.animate}
            exit={pinnedSidebarMotion.exit}
            transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
          >
            <div
              className="flex h-full w-full flex-col items-center"
              style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH }}
            >
              <PinnedSidebarHeader
                onClose={() => {
                  armPeekSuppress();
                  updatePinned(false);
                }}
              />
              <SidebarList
                items={navItems}
                activeHref={current.href}
                surface="background"
              />
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function setDocumentTitle(title: string) {
  if (typeof document === "undefined") return;
  document.title = `${title} - طرحک`;
}
