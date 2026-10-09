"use client";

import { useEffect, useId, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import useMeasure from "react-use-measure";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  UserIcon,
  Notification03Icon,
  CreditCardIcon,
  SettingsIcon,
  LanguageCircleIcon,
  Moon02Icon,
  FolderIcon,
  File01Icon,
  Image01Icon,
  Share01Icon,
  HelpCircleIcon,
  LogoutIcon,
  MoreHorizontalCircle01Icon,
  SecurityLockIcon,
  PaintBoardIcon,
} from "@hugeicons/core-free-icons";

type IconType = ComponentType<Record<string, unknown>>;

type MenuLeaf = {
  id: string;
  label: string;
  icon: IconType;
  danger?: boolean;
};

type MenuBranch = {
  id: string;
  label: string;
  icon: IconType;
  children: MenuLeaf[];
};

type MenuEntry =
  | MenuLeaf
  | MenuBranch
  | { id: "divider"; label?: never; icon?: never };

function isBranch(item: MenuEntry): item is MenuBranch {
  return "children" in item && Array.isArray(item.children);
}

// Change Here
const ROOT_ITEMS: MenuEntry[] = [
  { id: "profile", label: "پروفایل", icon: UserIcon },
  {
    id: "workspace",
    label: "فضای کار",
    icon: FolderIcon,
    children: [
      { id: "projects", label: "پروژه‌ها", icon: FolderIcon },
      { id: "files", label: "فایل‌ها", icon: File01Icon },
      { id: "media", label: "رسانه", icon: Image01Icon },
      { id: "share", label: "اشتراک‌گذاری", icon: Share01Icon },
    ],
  },
  {
    id: "preferences",
    label: "ترجیحات",
    icon: SettingsIcon,
    children: [
      { id: "appearance", label: "ظاهر", icon: PaintBoardIcon },
      { id: "language", label: "زبان", icon: LanguageCircleIcon },
      { id: "theme", label: "تم", icon: Moon02Icon },
      { id: "security", label: "امنیت", icon: SecurityLockIcon },
    ],
  },
  { id: "billing", label: "صورتحساب", icon: CreditCardIcon },
  { id: "notifications", label: "اعلان‌ها", icon: Notification03Icon },
  { id: "divider" },
  { id: "help", label: "راهنما", icon: HelpCircleIcon },
  { id: "logout", label: "خروج", icon: LogoutIcon, danger: true },
];

const easeOutQuint: [number, number, number, number] = [0.23, 1, 0.32, 1];
const OPEN_WIDTH = 260;

const shellSpring = {
  type: "spring" as const,
  damping: 34,
  stiffness: 380,
  mass: 0.8,
};

const indicatorSpring = {
  type: "spring" as const,
  damping: 30,
  stiffness: 520,
  mass: 0.8,
};

const panelSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
  mass: 0.85,
};

export default function NestedDropdown() {
  const reduceMotion = useReducedMotion() ?? false;
  const layoutId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [stack, setStack] = useState<MenuBranch[]>([]);
  const [activeItem, setActiveItem] = useState("profile");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [navDir, setNavDir] = useState<1 | -1>(1);

  const current = stack[stack.length - 1] ?? null;
  const items: MenuEntry[] = current ? current.children : ROOT_ITEMS;
  const panelKey = current?.id ?? "root";

  const [contentRef, contentBounds] = useMeasure({ offsetSize: true });
  const measuredHeight = Math.max(40, Math.ceil(contentBounds.height));
  const [peakHeight, setPeakHeight] = useState(40);
  const [wasOpen, setWasOpen] = useState(false);
  const [peakPanel, setPeakPanel] = useState(panelKey);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (!isOpen) {
      setPeakHeight(40);
      setPeakPanel("root");
      setStack([]);
      setHoveredItem(null);
    }
  } else if (isOpen && panelKey !== peakPanel) {
    // New nested level — allow shell to resize to the new panel.
    setPeakPanel(panelKey);
    setPeakHeight(measuredHeight);
  } else if (isOpen && measuredHeight > peakHeight) {
    setPeakHeight(measuredHeight);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (stack.length > 0) {
          setNavDir(-1);
          setStack((s) => s.slice(0, -1));
          setHoveredItem(null);
        } else {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, stack.length]);

  const openHeight = isOpen ? Math.max(measuredHeight, peakHeight) : 40;

  const openSub = (branch: MenuBranch) => {
    setNavDir(1);
    setHoveredItem(null);
    setStack((s) => [...s, branch]);
  };

  const goBack = () => {
    setNavDir(-1);
    setHoveredItem(null);
    setStack((s) => s.slice(0, -1));
  };

  const pickLeaf = (item: MenuLeaf) => {
    setActiveItem(item.id);
    if (item.danger) setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      dir="rtl"
      lang="fa"
      className="relative h-10 w-10 not-prose font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? OPEN_WIDTH : 40,
          height: isOpen ? openHeight : 40,
          borderRadius: isOpen ? 14 : 12,
        }}
        transition={
          reduceMotion
            ? { duration: 0.15 }
            : {
                width: shellSpring,
                height: shellSpring,
                borderRadius: { duration: 0.2 },
              }
        }
        role="button"
        tabIndex={isOpen ? -1 : 0}
        aria-label={isOpen ? undefined : "باز کردن منو"}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="absolute top-0 end-0 origin-top-end cursor-pointer overflow-hidden border border-border bg-popover shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => !isOpen && setIsOpen(true)}
        onKeyDown={(event) => {
          if (isOpen) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 0 : 1,
            scale: isOpen ? 0.8 : 1,
          }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: isOpen ? "none" : "auto" }}
        >
          <HugeiconsIcon
            icon={MoreHorizontalCircle01Icon}
            className="h-6 w-6 text-muted-foreground"
          />
        </motion.div>

        <div ref={contentRef}>
          <motion.div
            layoutRoot
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{
              duration: 0.2,
              delay: isOpen ? 0.08 : 0,
            }}
            className="p-2"
            style={{ pointerEvents: isOpen ? "auto" : "none" }}
            role="menu"
            aria-label={current ? current.label : "منوی حساب"}
          >
            <AnimatePresence mode="popLayout" initial={false} custom={navDir}>
              <motion.div
                key={panelKey}
                custom={navDir}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        x: navDir * -36,
                        filter: "blur(6px)",
                      }
                }
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        x: navDir * 36,
                        filter: "blur(6px)",
                      }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.12 }
                    : {
                        ...panelSpring,
                        opacity: { duration: 0.22 },
                        filter: { duration: 0.28 },
                      }
                }
              >
                {current ? (
                  <motion.button
                    type="button"
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, x: 10 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04, duration: 0.25, ease: easeOutQuint }}
                    onClick={goBack}
                    className="mb-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                    />
                    <span className="min-w-0 flex-1 truncate text-start">
                      {current.label}
                    </span>
                  </motion.button>
                ) : null}

                <ul
                  className="m-0! flex list-none! flex-col gap-0.5 p-0!"
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {items.map((item, index) => {
                    if (item.id === "divider") {
                      return (
                        <motion.hr
                          key={`${panelKey}-divider`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isOpen ? 1 : 0 }}
                          transition={{
                            delay: isOpen ? 0.1 + index * 0.015 : 0,
                          }}
                          className="pointer-events-none my-1.5! border-border"
                        />
                      );
                    }

                    const branch = isBranch(item);
                    const leaf = item as MenuLeaf;
                    const isActive = !branch && activeItem === item.id;
                    const isDanger = !branch && Boolean(leaf.danger);
                    const showIndicator = hoveredItem
                      ? hoveredItem === item.id
                      : isActive;

                    const itemDelay = isOpen ? 0.05 + index * 0.025 : 0;

                    return (
                      <motion.li
                        key={`${panelKey}-${item.id}`}
                        role="menuitem"
                        initial={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, x: -10 }
                        }
                        animate={{
                          opacity: isOpen ? 1 : 0,
                          x: isOpen ? 0 : -10,
                        }}
                        transition={{
                          delay: itemDelay,
                          duration: 0.22,
                          ease: easeOutQuint,
                        }}
                        onClick={() => {
                          if (branch) openSub(item);
                          else pickLeaf(leaf);
                        }}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        className={`relative m-0! flex cursor-pointer items-center gap-3 rounded-lg py-2! pe-2! ps-3! text-sm leading-normal transition-colors duration-200 ease-out ${
                          isDanger && showIndicator
                            ? "text-red-600 dark:text-red-400"
                            : isActive
                              ? "text-foreground"
                              : isDanger
                                ? "text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {showIndicator ? (
                          <motion.div
                            layoutId={`${layoutId}-active`}
                            className={`absolute inset-0 rounded-lg ${
                              isDanger ? "bg-red-500/10" : "bg-muted"
                            }`}
                            transition={
                              reduceMotion
                                ? { duration: 0 }
                                : indicatorSpring
                            }
                          />
                        ) : null}
                        {showIndicator ? (
                          <motion.div
                            layoutId={`${layoutId}-bar`}
                            className={`absolute start-0 top-0 bottom-0 my-auto h-5 w-[3px] rounded-full ${
                              isDanger ? "bg-red-500" : "bg-foreground"
                            }`}
                            transition={
                              reduceMotion
                                ? { duration: 0 }
                                : indicatorSpring
                            }
                          />
                        ) : null}

                        <HugeiconsIcon
                          icon={item.icon}
                          className={`relative z-10 h-[18px] w-[18px] shrink-0${
                            isDanger ? " -scale-x-100" : ""
                          }`}
                        />
                        <span className="relative z-10 flex-1 font-medium tracking-normal">
                          {item.label}
                        </span>
                        {branch ? (
                          <HugeiconsIcon
                            icon={ArrowLeft01Icon}
                            className="relative z-10 h-4 w-4 shrink-0 opacity-55"
                          />
                        ) : null}
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
