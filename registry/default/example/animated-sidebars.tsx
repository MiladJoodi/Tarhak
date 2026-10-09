"use client";

import { useEffect, useId, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ChartHistogramIcon,
  CreditCardIcon,
  DashboardSquare01Icon,
  File01Icon,
  FolderIcon,
  Home01Icon,
  Image01Icon,
  Menu01Icon,
  Notification03Icon,
  SettingsIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

const spring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.75,
};

const widthTween = {
  type: "tween" as const,
  duration: 0.28,
  ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
};

const ROW_EASE: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

type NavLeaf = {
  id: string;
  label: string;
  icon: IconSvgElement;
};

type NavBranch = {
  id: string;
  label: string;
  icon: IconSvgElement;
  children: NavLeaf[];
};

type NavItem = NavLeaf | NavBranch;

function isBranch(item: NavItem): item is NavBranch {
  return "children" in item && Array.isArray(item.children);
}

const NAV: NavItem[] = [
  { id: "home", label: "خانه", icon: Home01Icon },
  { id: "dashboard", label: "داشبورد", icon: DashboardSquare01Icon },
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
  {
    id: "insights",
    label: "تحلیل",
    icon: ChartHistogramIcon,
    children: [
      { id: "reports", label: "گزارش‌ها", icon: File01Icon },
      { id: "billing", label: "صورتحساب", icon: CreditCardIcon },
    ],
  },
  { id: "team", label: "تیم", icon: UserIcon },
  { id: "alerts", label: "اعلان‌ها", icon: Notification03Icon },
  { id: "settings", label: "تنظیمات", icon: SettingsIcon },
];

function ActiveBar({ layoutId }: { layoutId: string }) {
  return (
    <motion.span
      layoutId={layoutId}
      className="absolute inset-y-1 start-0 w-[3px] rounded-full bg-foreground"
      transition={spring}
    />
  );
}

export function SoftSidebarRail({
  className,
}: {
  className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId();
  const [expanded, setExpanded] = useState(true);
  const [active, setActive] = useState("home");
  const [openBranch, setOpenBranch] = useState<string | null>("workspace");

  useEffect(() => {
    if (expanded) return;
    setOpenBranch(null);
  }, [expanded]);

  return (
    <MotionConfig
      transition={{ type: "spring", duration: 0.85, bounce: 0.35 }}
    >
      <motion.aside
        dir="rtl"
        lang="fa"
        aria-label="سایدبار ریل"
        initial={false}
        animate={{ width: expanded ? 380 : 76 }}
        transition={reduce ? { duration: 0.15 } : widthTween}
        className={clsx(
          "relative flex h-[min(90dvh,880px)] shrink-0 flex-col overflow-hidden border border-border bg-card fill-muted-foreground/70",
          "font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
          className,
        )}
        style={{ borderRadius: 20, borderWidth: 1 }}
      >
        <div
          className={clsx(
            "flex items-center border-b border-border py-3.5",
            expanded ? "gap-3 px-3" : "justify-center px-0",
          )}
        >
          <button
            type="button"
            aria-label={expanded ? "جمع کردن سایدبار" : "باز کردن سایدبار"}
            aria-expanded={expanded}
            onClick={() => {
              setExpanded((v) => {
                if (v) setOpenBranch(null);
                return !v;
              });
            }}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HugeiconsIcon
              icon={expanded ? ArrowRight01Icon : Menu01Icon}
              size={22}
            />
          </button>
          {expanded ? (
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-base font-medium text-foreground">
                ترهک
              </p>
              <p className="truncate text-xs text-muted-foreground">
                استودیو طراحی
              </p>
            </div>
          ) : null}
        </div>

        <nav
          className={clsx(
            "flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            expanded ? "p-1.5" : "items-center gap-1.5 px-0 py-1.5",
          )}
        >
          <LayoutGroup id={`${uid}-rail`}>
            {NAV.map((item) => {
              const branch = isBranch(item);
              const selected =
                active === item.id ||
                (branch && item.children.some((c) => c.id === active));
              const open = openBranch === item.id;

              return (
                <div
                  key={item.id}
                  className={clsx("relative", expanded && "w-full")}
                >
                  <button
                    type="button"
                    aria-label={item.label}
                    aria-expanded={branch ? open : undefined}
                    onClick={() => {
                      if (branch) {
                        setOpenBranch((id) =>
                          id === item.id ? null : item.id,
                        );
                        return;
                      }
                      setActive(item.id);
                      setOpenBranch(null);
                    }}
                    className={clsx(
                      "relative flex cursor-default items-center outline-none transition-colors",
                      "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                      expanded
                        ? "w-full justify-start gap-3 rounded-2xl px-3 py-2.5 text-start"
                        : "size-11 shrink-0 justify-center rounded-2xl p-0",
                      selected || open
                        ? "bg-accent text-foreground"
                        : "text-foreground",
                    )}
                  >
                    {expanded && selected && !open ? (
                      <ActiveBar layoutId={`${uid}-rail-bar`} />
                    ) : null}
                    <span className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
                      <HugeiconsIcon icon={item.icon} size={24} />
                    </span>
                    {expanded ? (
                      <>
                        <span className="min-w-0 flex-1 overflow-hidden">
                          <span className="block truncate text-base">
                            {item.label}
                          </span>
                        </span>
                        {branch ? (
                          <motion.span
                            animate={{ rotate: open ? 180 : 0 }}
                            transition={
                              reduce ? { duration: 0.15 } : spring
                            }
                            className="shrink-0 text-muted-foreground"
                          >
                            <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
                          </motion.span>
                        ) : null}
                      </>
                    ) : null}
                  </button>

                  {expanded ? (
                    <AnimatePresence initial={false}>
                      {open && branch ? (
                        <motion.div
                          key={`${item.id}-tree`}
                          role="menu"
                          aria-label={item.label}
                          initial={
                            reduce ? false : { height: 0, opacity: 0 }
                          }
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={reduce ? { duration: 0.15 } : spring}
                          className="overflow-hidden"
                        >
                          <ul className="relative flex flex-col pb-1">
                            {item.children.map((child, i, arr) => {
                              const last = i === arr.length - 1;
                              const first = i === 0;
                              return (
                                <motion.li
                                  key={child.id}
                                  initial={
                                    reduce ? false : { opacity: 0, y: 12 }
                                  }
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    type: "spring",
                                    bounce: 0.1,
                                    duration: 0.25,
                                    delay: reduce ? 0 : (i + 2) * 0.025,
                                    ease: ROW_EASE,
                                  }}
                                  className="relative flex min-h-11 items-stretch"
                                >
                                  <span
                                    aria-hidden
                                    className={clsx(
                                      "pointer-events-none absolute start-[1.5rem] w-px bg-border",
                                      last
                                        ? first
                                          ? "top-[-0.75rem] h-[calc(50%+0.75rem)]"
                                          : "top-0 h-1/2"
                                        : first
                                          ? "bottom-0 top-[-0.75rem]"
                                          : "inset-y-0",
                                    )}
                                  />
                                  <span
                                    aria-hidden
                                    className="pointer-events-none absolute start-[1.5rem] top-1/2 h-px w-3.5 -translate-y-1/2 bg-border"
                                  />
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => setActive(child.id)}
                                    className={clsx(
                                      "relative my-0.5 ms-9 flex min-w-0 flex-1 cursor-default items-center gap-3 rounded-2xl px-3 py-2 text-start text-base outline-none",
                                      "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                                      active === child.id
                                        ? "bg-accent text-foreground"
                                        : "text-foreground",
                                    )}
                                  >
                                    {active === child.id ? (
                                      <ActiveBar
                                        layoutId={`${uid}-rail-bar`}
                                      />
                                    ) : null}
                                    <span className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
                                      <HugeiconsIcon
                                        icon={child.icon}
                                        size={22}
                                      />
                                    </span>
                                    <span className="min-w-0 flex-1 truncate">
                                      {child.label}
                                    </span>
                                  </button>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  ) : null}

                  <AnimatePresence>
                    {open && branch && !expanded ? (
                      <motion.div
                        key={`${item.id}-flyout`}
                        role="menu"
                        aria-label={item.label}
                        initial={
                          reduce
                            ? false
                            : { opacity: 0, x: -8, scale: 0.98 }
                        }
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -8, scale: 0.98 }}
                        transition={spring}
                        className="absolute top-0 end-[calc(100%+10px)] z-20 w-60 overflow-hidden border border-border bg-card px-1 py-1"
                        style={{ borderRadius: 20, borderWidth: 1 }}
                      >
                        <p className="px-3 pb-1 pt-2 text-xs text-muted-foreground">
                          {item.label}
                        </p>
                        {item.children.map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setActive(child.id);
                              setOpenBranch(null);
                            }}
                            className={clsx(
                              "flex w-full cursor-default items-center gap-3 rounded-2xl px-3 py-2 text-start text-base outline-none",
                              "hover:bg-accent",
                              active === child.id
                                ? "bg-accent text-foreground"
                                : "text-foreground",
                            )}
                          >
                            <span className="text-muted-foreground">
                              <HugeiconsIcon icon={child.icon} size={22} />
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              {child.label}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </LayoutGroup>
        </nav>
      </motion.aside>
    </MotionConfig>
  );
}

const SHELL =
  "fill-muted-foreground/70 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal";

export default function AnimatedSidebars() {
  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="سایدبار ریل جمع‌شونده"
      className={clsx(
        "flex w-full max-w-[380px] flex-col items-stretch md:max-w-[420px]",
        SHELL,
      )}
    >
      <SoftSidebarRail />
    </section>
  );
}
