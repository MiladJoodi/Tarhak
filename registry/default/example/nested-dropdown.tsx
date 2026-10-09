"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import clsx from "clsx";
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

type MenuLeaf = {
  id: string;
  label: string;
  icon: IconSvgElement;
  danger?: boolean;
};

type MenuBranch = {
  id: string;
  label: string;
  icon: IconSvgElement;
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

const ROW_EASE: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

function MenuRow(props: {
  index: number;
  item: MenuLeaf | MenuBranch;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onOpenBranch: (branch: MenuBranch) => void;
}) {
  const { index, item, setIsOpen, onOpenBranch } = props;
  const branch = isBranch(item);
  const leaf = item as MenuLeaf;
  const danger = !branch && Boolean(leaf.danger);
  const delay = (index + 8) * 0.025;

  return (
    <motion.div
      role="menuitem"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        bounce: 0.1,
        duration: 0.25,
        delay,
        ease: ROW_EASE,
      }}
      onClick={() => {
        if (branch) {
          onOpenBranch(item);
          return;
        }
        setTimeout(() => setIsOpen(false), 120);
      }}
      className={clsx(
        "flex cursor-default items-center justify-between rounded-2xl px-4 py-3 text-foreground hover:bg-accent",
        danger && "text-destructive hover:bg-destructive/10",
      )}
    >
      <div className="flex min-w-0 items-center gap-x-3">
        <span
          className={clsx(
            "shrink-0 text-muted-foreground",
            danger && "text-destructive -scale-x-100",
          )}
        >
          <HugeiconsIcon icon={item.icon} size={24} />
        </span>
        <span className="truncate">{item.label}</span>
      </div>

      {branch ? (
        <span className="shrink-0 text-muted-foreground">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
        </span>
      ) : null}
    </motion.div>
  );
}

export default function NestedDropdown() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [stack, setStack] = useState<MenuBranch[]>([]);
  const [navDir, setNavDir] = useState<1 | -1>(1);

  const current = stack[stack.length - 1] ?? null;
  const items: MenuEntry[] = current ? current.children : ROOT_ITEMS;
  const panelKey = current?.id ?? "root";

  useEffect(() => {
    if (!isOpen) setStack([]);
  }, [isOpen]);

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
      if (event.key !== "Escape") return;
      if (stack.length > 0) {
        setNavDir(-1);
        setStack((s) => s.slice(0, -1));
      } else {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, stack.length]);

  const openSub = (branch: MenuBranch) => {
    setNavDir(1);
    setStack((s) => [...s, branch]);
  };

  const goBack = () => {
    setNavDir(-1);
    setStack((s) => s.slice(0, -1));
  };

  return (
    <section
      ref={containerRef}
      dir="rtl"
      lang="fa"
      aria-label="منوی تو‌در‌تو"
      className="relative flex h-20 w-20 items-center justify-center fill-muted-foreground/70 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <MotionConfig
        transition={{ type: "spring", duration: 0.85, bounce: 0.35 }}
      >
        {!isOpen ? (
          <div
            role="button"
            tabIndex={0}
            aria-label="باز کردن منو"
            aria-expanded={false}
            aria-haspopup="menu"
            onClick={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen(true);
              }
            }}
            className="relative flex h-20 w-20 cursor-pointer items-center justify-center"
          >
            <HugeiconsIcon
              icon={MoreHorizontalCircle01Icon}
              className="relative z-10 fill-none text-foreground"
              size={36}
            />
            <motion.div
              layoutId="nested-dropdown-shell"
              className="absolute inset-0 z-[2] border-border bg-background"
              style={{ borderRadius: 40, borderWidth: 1 }}
            />
          </div>
        ) : (
          <motion.section
            layoutId="nested-dropdown-shell"
            className="absolute top-0 end-0 z-20 w-80 overflow-hidden border border-border bg-card px-2.5 py-2.5 text-xl"
            style={{ borderRadius: 20, borderWidth: 1 }}
            role="menu"
            aria-label={current ? current.label : "منوی حساب"}
            aria-expanded
          >
            <AnimatePresence mode="popLayout" initial={false} custom={navDir}>
              <motion.div
                key={panelKey}
                custom={navDir}
                initial={{ opacity: 0, x: navDir * -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: navDir * 24 }}
                transition={{
                  type: "spring",
                  bounce: 0.1,
                  duration: 0.35,
                }}
                className="flex flex-col gap-1.5"
              >
                {current ? (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      bounce: 0.1,
                      duration: 0.25,
                      delay: 0.05,
                      ease: ROW_EASE,
                    }}
                    onClick={goBack}
                    className="flex w-full cursor-default items-center gap-x-3 rounded-2xl px-4 py-3 text-foreground hover:bg-accent"
                  >
                    <span className="text-muted-foreground">
                      <HugeiconsIcon icon={ArrowRight01Icon} size={24} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-start">
                      {current.label}
                    </span>
                  </motion.button>
                ) : null}

                {items.map((item, index) => {
                  if (item.id === "divider") {
                    return (
                      <div
                        key={`${panelKey}-divider`}
                        className="mx-4 my-1.5 h-px bg-border"
                        role="separator"
                      />
                    );
                  }

                  return (
                    <MenuRow
                      key={`${panelKey}-${item.id}`}
                      index={index}
                      item={item as MenuLeaf | MenuBranch}
                      setIsOpen={setIsOpen}
                      onOpenBranch={openSub}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </motion.section>
        )}
      </MotionConfig>
    </section>
  );
}
