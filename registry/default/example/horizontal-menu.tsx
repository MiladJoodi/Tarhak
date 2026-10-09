"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  BookOpen01Icon,
  Briefcase01Icon,
  Building03Icon,
  ChartHistogramIcon,
  CreditCardIcon,
  File01Icon,
  FolderIcon,
  HelpCircleIcon,
  Image01Icon,
  Layers01Icon,
  Megaphone01Icon,
  NewsIcon,
  PaintBoardIcon,
  Rocket01Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

const ROW_EASE: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

const spring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.75,
};

type MenuLeaf = {
  id: string;
  label: string;
  icon: IconSvgElement;
};

type MenuBranch = {
  id: string;
  label: string;
  icon: IconSvgElement;
  children: MenuItem[];
};

type MenuItem = MenuLeaf | MenuBranch;

function isBranch(item: MenuItem): item is MenuBranch {
  return "children" in item && Array.isArray(item.children);
}

const TOP: MenuItem[] = [
  {
    id: "products",
    label: "محصولات",
    icon: Layers01Icon,
    children: [
      {
        id: "studio",
        label: "استودیو",
        icon: PaintBoardIcon,
        children: [
          { id: "canvas", label: "بوم طراحی", icon: Image01Icon },
          { id: "components", label: "کامپوننت‌ها", icon: Layers01Icon },
          { id: "templates", label: "قالب‌ها", icon: File01Icon },
        ],
      },
      {
        id: "workspace",
        label: "فضای کار",
        icon: FolderIcon,
        children: [
          { id: "projects", label: "پروژه‌ها", icon: FolderIcon },
          { id: "files", label: "فایل‌ها", icon: File01Icon },
          { id: "media", label: "رسانه", icon: Image01Icon },
        ],
      },
      { id: "analytics", label: "تحلیل", icon: ChartHistogramIcon },
    ],
  },
  {
    id: "solutions",
    label: "راه‌حل‌ها",
    icon: Briefcase01Icon,
    children: [
      { id: "startups", label: "استارتاپ‌ها", icon: Rocket01Icon },
      { id: "teams", label: "تیم‌ها", icon: UserGroupIcon },
      {
        id: "enterprise",
        label: "سازمانی",
        icon: Building03Icon,
        children: [
          { id: "security", label: "امنیت", icon: Building03Icon },
          { id: "billing", label: "صورتحساب", icon: CreditCardIcon },
          { id: "support", label: "پشتیبانی", icon: HelpCircleIcon },
        ],
      },
    ],
  },
  {
    id: "resources",
    label: "منابع",
    icon: BookOpen01Icon,
    children: [
      { id: "docs", label: "مستندات", icon: BookOpen01Icon },
      { id: "blog", label: "بلاگ", icon: NewsIcon },
      { id: "changelog", label: "تغییرات", icon: Megaphone01Icon },
    ],
  },
  { id: "pricing", label: "قیمت‌ها", icon: CreditCardIcon },
  { id: "about", label: "درباره", icon: UserIcon },
];

function useHoverIntent(delayMs = 120) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return {
    enter(fn: () => void) {
      if (timer.current) clearTimeout(timer.current);
      fn();
    },
    leave(fn: () => void) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(fn, delayMs);
    },
  };
}

function NestedPanel({
  items,
  onPick,
  reduce,
}: {
  items: MenuItem[];
  onPick: (id: string) => void;
  reduce: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const intent = useHoverIntent(110);

  return (
    <motion.div
      role="menu"
      initial={reduce ? false : { opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 6 }}
      transition={spring}
      className="absolute start-full top-0 z-40 ms-1 min-w-[168px] overflow-visible border border-border bg-card p-0.5 md:ms-1.5 md:min-w-[220px] md:p-1"
      style={{ borderRadius: 16, borderWidth: 1 }}
    >
      <div className="flex flex-col gap-0.5">
        {items.map((item, index) => {
          const branch = isBranch(item);
          const open = openId === item.id;

          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() =>
                intent.enter(() => setOpenId(branch ? item.id : null))
              }
              onMouseLeave={() =>
                intent.leave(() => {
                  if (openId === item.id) setOpenId(null);
                })
              }
            >
              <button
                type="button"
                role="menuitem"
                aria-haspopup={branch ? "menu" : undefined}
                aria-expanded={branch ? open : undefined}
                onClick={() => {
                  if (branch) {
                    setOpenId((id) => (id === item.id ? null : item.id));
                    return;
                  }
                  onPick(item.id);
                }}
                className={clsx(
                  "flex w-full cursor-default items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-start text-sm text-foreground outline-none md:gap-3 md:rounded-2xl md:px-3 md:py-2.5 md:text-base",
                  "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  open && "bg-accent",
                )}
              >
                <span className="flex min-w-0 items-center gap-2 md:gap-3">
                  <span className="shrink-0 text-muted-foreground [&_svg]:size-4 md:[&_svg]:size-[22px]">
                    <HugeiconsIcon icon={item.icon} size={22} />
                  </span>
                  <motion.span
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      bounce: 0.1,
                      duration: 0.25,
                      delay: reduce ? 0 : (index + 2) * 0.025,
                      ease: ROW_EASE,
                    }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                </span>
                {branch ? (
                  <span className="shrink-0 text-muted-foreground [&_svg]:size-3 md:[&_svg]:size-4">
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                  </span>
                ) : null}
              </button>

              <AnimatePresence>
                {open && branch ? (
                  <NestedPanel
                    items={item.children}
                    onPick={onPick}
                    reduce={reduce}
                  />
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function SoftHorizontalMenu({
  className,
}: {
  className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  const intent = useHoverIntent(140);
  const [openTop, setOpenTop] = useState<string | null>(null);
  const [openChild, setOpenChild] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const openTopRef = useRef(openTop);
  openTopRef.current = openTop;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenTop(null);
        setOpenChild(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenTop(null);
        setOpenChild(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <MotionConfig
      transition={{ type: "spring", duration: 0.85, bounce: 0.35 }}
    >
      <nav
        ref={rootRef}
        dir="rtl"
        lang="fa"
        aria-label="منوی افقی"
        className={clsx(
          "relative inline-flex max-w-full flex-nowrap items-center gap-0.5 overflow-visible rounded-2xl border border-border bg-card p-1 fill-muted-foreground/70 md:gap-1 md:rounded-[20px] md:p-1.5",
          "font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
          className,
        )}
        style={{ borderWidth: 1 }}
      >
        {TOP.map((item) => {
          const branch = isBranch(item);
          const open = openTop === item.id;
          const selected = active === item.id;

          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() =>
                intent.enter(() => {
                  if (branch) {
                    if (openTopRef.current !== item.id) setOpenChild(null);
                    setOpenTop(item.id);
                  } else {
                    setOpenTop(null);
                    setOpenChild(null);
                  }
                })
              }
              onMouseLeave={() =>
                intent.leave(() => {
                  if (openTopRef.current === item.id) {
                    setOpenTop(null);
                    setOpenChild(null);
                  }
                })
              }
            >
              <button
                type="button"
                aria-haspopup={branch ? "menu" : undefined}
                aria-expanded={branch ? open : undefined}
                onClick={() => {
                  if (branch) {
                    setOpenTop((id) => (id === item.id ? null : item.id));
                    return;
                  }
                  setActive(item.id);
                  setOpenTop(null);
                }}
                className={clsx(
                  "relative flex cursor-default items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm outline-none transition-colors md:gap-2 md:rounded-2xl md:px-3.5 md:py-2.5 md:text-base",
                  "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  open || selected
                    ? "bg-accent text-foreground"
                    : "text-foreground",
                )}
              >
                <span className="text-muted-foreground [&_svg]:size-3.5 md:[&_svg]:size-5">
                  <HugeiconsIcon icon={item.icon} size={20} />
                </span>
                <span>{item.label}</span>
                {branch ? (
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={reduce ? { duration: 0.15 } : spring}
                    className="text-muted-foreground [&_svg]:size-3 md:[&_svg]:size-3.5"
                  >
                    <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                  </motion.span>
                ) : null}
              </button>

              <AnimatePresence>
                {open && branch ? (
                  <motion.div
                    key={`${uid}-${item.id}`}
                    role="menu"
                    aria-label={item.label}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={spring}
                    className="absolute start-0 top-[calc(100%+6px)] z-30 min-w-[180px] overflow-visible border border-border bg-card p-0.5 md:top-[calc(100%+8px)] md:min-w-[240px] md:p-1"
                    style={{ borderRadius: 16, borderWidth: 1 }}
                  >
                    <div className="flex flex-col gap-0.5">
                      {item.children.map((child, index) => {
                        const childBranch = isBranch(child);
                        const childOpen = openChild === child.id;

                        return (
                          <div
                            key={child.id}
                            className="relative"
                            onMouseEnter={() =>
                              intent.enter(() =>
                                setOpenChild(
                                  childBranch ? child.id : null,
                                ),
                              )
                            }
                            onMouseLeave={() =>
                              intent.leave(() => {
                                if (openChild === child.id) {
                                  setOpenChild(null);
                                }
                              })
                            }
                          >
                            <button
                              type="button"
                              role="menuitem"
                              aria-haspopup={
                                childBranch ? "menu" : undefined
                              }
                              aria-expanded={
                                childBranch ? childOpen : undefined
                              }
                              onClick={() => {
                                if (childBranch) {
                                  setOpenChild((id) =>
                                    id === child.id ? null : child.id,
                                  );
                                  return;
                                }
                                setActive(child.id);
                                setOpenTop(null);
                                setOpenChild(null);
                              }}
                              className={clsx(
                                "flex w-full cursor-default items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-start text-sm text-foreground outline-none md:gap-3 md:rounded-2xl md:px-3 md:py-2.5 md:text-base",
                                "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                                childOpen && "bg-accent",
                              )}
                            >
                              <span className="flex min-w-0 items-center gap-2 md:gap-3">
                                <span className="shrink-0 text-muted-foreground [&_svg]:size-4 md:[&_svg]:size-[22px]">
                                  <HugeiconsIcon
                                    icon={child.icon}
                                    size={22}
                                  />
                                </span>
                                <motion.span
                                  initial={
                                    reduce ? false : { opacity: 0, y: 10 }
                                  }
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    type: "spring",
                                    bounce: 0.1,
                                    duration: 0.25,
                                    delay: reduce
                                      ? 0
                                      : (index + 2) * 0.025,
                                    ease: ROW_EASE,
                                  }}
                                  className="truncate"
                                >
                                  {child.label}
                                </motion.span>
                              </span>
                              {childBranch ? (
                                <span className="shrink-0 text-muted-foreground [&_svg]:size-3 md:[&_svg]:size-4">
                                  <HugeiconsIcon
                                    icon={ArrowLeft01Icon}
                                    size={16}
                                  />
                                </span>
                              ) : null}
                            </button>

                            <AnimatePresence>
                              {childOpen && childBranch ? (
                                <NestedPanel
                                  items={child.children}
                                  onPick={(id) => {
                                    setActive(id);
                                    setOpenTop(null);
                                    setOpenChild(null);
                                  }}
                                  reduce={reduce}
                                />
                              ) : null}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </MotionConfig>
  );
}

const SHELL =
  "fill-muted-foreground/70 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal";

export default function HorizontalMenu() {
  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="منوی ناوبری افقی"
      className={clsx(
        "flex w-full flex-col items-center justify-center overflow-visible px-3 py-6 max-md:min-h-[280px] md:min-h-[min(70dvh,560px)] md:px-16 md:py-10",
        SHELL,
      )}
    >
      <SoftHorizontalMenu className="shrink-0" />
    </section>
  );
}
