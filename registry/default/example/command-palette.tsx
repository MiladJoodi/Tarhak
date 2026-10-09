"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Search01Icon,
  Home01Icon,
  DashboardSquare01Icon,
  File01Icon,
  FolderIcon,
  SettingsIcon,
  Moon02Icon,
  Sun03Icon,
  UserIcon,
  Notification03Icon,
  Copy01Icon,
  Add01Icon,
  LogoutIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

export type CommandItem = {
  id: string;
  label: string;
  keywords?: string;
  shortcut?: string;
  icon: IconSvgElement;
  group: string;
  danger?: boolean;
};

// Change Here
const DEFAULT_COMMANDS: CommandItem[] = [
  {
    id: "home",
    label: "رفتن به خانه",
    keywords: "خانه home",
    shortcut: "G H",
    icon: Home01Icon,
    group: "ناوبری",
  },
  {
    id: "dashboard",
    label: "داشبورد",
    keywords: "dashboard پنل",
    shortcut: "G D",
    icon: DashboardSquare01Icon,
    group: "ناوبری",
  },
  {
    id: "files",
    label: "فایل‌ها",
    keywords: "files فایل",
    shortcut: "G F",
    icon: File01Icon,
    group: "ناوبری",
  },
  {
    id: "projects",
    label: "پروژه‌ها",
    keywords: "projects پروژه",
    icon: FolderIcon,
    group: "ناوبری",
  },
  {
    id: "new-doc",
    label: "سند جدید",
    keywords: "new create سند",
    shortcut: "N",
    icon: Add01Icon,
    group: "عملیات",
  },
  {
    id: "copy-link",
    label: "کپی لینک صفحه",
    keywords: "copy link کپی",
    shortcut: "⌘⇧C",
    icon: Copy01Icon,
    group: "عملیات",
  },
  {
    id: "profile",
    label: "پروفایل من",
    keywords: "profile کاربر",
    icon: UserIcon,
    group: "عملیات",
  },
  {
    id: "notifications",
    label: "اعلان‌ها",
    keywords: "notifications اعلان",
    shortcut: "⌘.",
    icon: Notification03Icon,
    group: "عملیات",
  },
  {
    id: "theme-dark",
    label: "تم تیره",
    keywords: "dark theme تاریک",
    icon: Moon02Icon,
    group: "تنظیمات",
  },
  {
    id: "theme-light",
    label: "تم روشن",
    keywords: "light theme روشن",
    icon: Sun03Icon,
    group: "تنظیمات",
  },
  {
    id: "settings",
    label: "تنظیمات",
    keywords: "settings تنظیمات",
    shortcut: "⌘,",
    icon: SettingsIcon,
    group: "تنظیمات",
  },
  {
    id: "logout",
    label: "خروج از حساب",
    keywords: "logout خروج",
    icon: LogoutIcon,
    group: "تنظیمات",
    danger: true,
  },
];

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchesQuery(item: CommandItem, query: string) {
  if (!query) return true;
  const hay = normalize(`${item.label} ${item.keywords ?? ""} ${item.group}`);
  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((part) => hay.includes(part));
}

function isModKey(event: KeyboardEvent) {
  return event.metaKey || event.ctrlKey;
}

export type CommandPaletteProps = {
  commands?: CommandItem[];
  /** Called when a command is chosen. */
  onRun?: (item: CommandItem) => void;
  className?: string;
  /** Start open (useful in docs/preview). */
  defaultOpen?: boolean;
};

export default function CommandPalette({
  commands = DEFAULT_COMMANDS,
  onRun,
  className,
  defaultOpen = false,
}: CommandPaletteProps) {
  const reduce = useReducedMotion();
  const listboxId = useId();
  const hostRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [modLabel, setModLabel] = useState("Ctrl");
  const [mounted, setMounted] = useState(false);
  /** Portal escapes preview `.dark` / `.light` — copy the nearest theme onto the overlay. */
  const [portalTheme, setPortalTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    setModLabel(mac ? "⌘" : "Ctrl");
  }, []);

  useEffect(() => {
    if (!open) return;
    const host = hostRef.current;
    const themed = host?.closest(".dark, .light");
    if (themed?.classList.contains("light")) {
      setPortalTheme("light");
      return;
    }
    if (themed?.classList.contains("dark")) {
      setPortalTheme("dark");
      return;
    }
    setPortalTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, [open]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return commands.filter((item) => matchesQuery(item, q));
  }, [commands, query]);

  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const flat = filtered;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const runCommand = useCallback(
    (item: CommandItem) => {
      setLastRun(item.label);
      onRun?.(item);
      close();
    },
    [close, onRun],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isModKey(event) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => {
          if (prev) {
            setQuery("");
            setActiveIndex(0);
            return false;
          }
          setQuery("");
          setActiveIndex(0);
          return true;
        });
        return;
      }
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= flat.length) {
      setActiveIndex(Math.max(0, flat.length - 1));
    }
  }, [activeIndex, flat.length]);

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) =>
        flat.length ? (i - 1 + flat.length) % flat.length : 0,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = flat[activeIndex];
      if (item) runCommand(item);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(0, flat.length - 1));
    }
  };

  let runningIndex = -1;

  return (
    <div
      ref={hostRef}
      dir="rtl"
      lang="fa"
      className={clsx(
        "relative flex w-full max-w-lg flex-col items-center gap-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        className,
      )}
    >
      <button
        type="button"
        onClick={openPalette}
        className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-start text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
      >
        <HugeiconsIcon icon={Search01Icon} size={18} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate text-sm">
          جست‌وجو یا اجرای دستور…
        </span>
        <kbd
          dir="ltr"
          className="hidden shrink-0 items-center gap-1 rounded-lg border border-border bg-muted px-2 py-1 text-[11px] tabular-nums text-muted-foreground sm:inline-flex"
        >
          <span>{modLabel}</span>
          <span>K</span>
        </kbd>
      </button>

      <AnimatePresence>
        {lastRun ? (
          <motion.p
            key={lastRun}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0 }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <HugeiconsIcon
              icon={Tick02Icon}
              size={16}
              className="text-emerald-600"
            />
            اجرا شد:{" "}
            <span className="font-medium text-foreground">{lastRun}</span>
          </motion.p>
        ) : (
          <p className="text-sm text-muted-foreground">
            با{" "}
            <kbd
              dir="ltr"
              className="mx-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] tabular-nums"
            >
              {modLabel}+K
            </kbd>{" "}
            باز کن · ↑↓ انتخاب · Enter اجرا
          </p>
        )}
      </AnimatePresence>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  key="overlay"
                  role="presentation"
                  dir="rtl"
                  lang="fa"
                  className={clsx(
                    portalTheme,
                    "fixed inset-0 z-120 flex items-start justify-center px-4 pt-[min(22vh,9.5rem)] backdrop-blur-[2px] font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif]",
                    portalTheme === "dark" ? "bg-black/45" : "bg-black/25",
                  )}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  onMouseDown={(e) => {
                    if (e.target === e.currentTarget) close();
                  }}
                >
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label="پالت فرمان"
                    initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="flex w-full max-w-lg flex-col overflow-hidden rounded-[22px] border border-border bg-popover text-popover-foreground shadow-2xl"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
                      <HugeiconsIcon
                        icon={Search01Icon}
                        size={18}
                        className="shrink-0 text-muted-foreground"
                      />
                      <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onInputKeyDown}
                        placeholder="چه دستوری را اجرا کنیم؟"
                        aria-controls={listboxId}
                        aria-autocomplete="list"
                        aria-activedescendant={
                          flat[activeIndex]
                            ? `${listboxId}-${flat[activeIndex]!.id}`
                            : undefined
                        }
                        className="min-w-0 flex-1 bg-transparent py-1.5 text-base outline-none placeholder:text-muted-foreground"
                      />
                      <kbd
                        dir="ltr"
                        className="shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        Esc
                      </kbd>
                    </div>

                    <div
                      id={listboxId}
                      role="listbox"
                      aria-label="نتایج دستورات"
                      className="max-h-[min(22rem,50vh)] overflow-y-auto overscroll-contain p-2"
                    >
                      {flat.length === 0 ? (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                          نتیجه‌ای برای «{query}» پیدا نشد
                        </p>
                      ) : (
                        groups.map(([group, items]) => (
                          <div key={group} className="mb-1.5 last:mb-0">
                            <p className="px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
                              {group}
                            </p>
                            <ul className="flex flex-col gap-0.5">
                              {items.map((item) => {
                                runningIndex += 1;
                                const index = runningIndex;
                                const active = index === activeIndex;
                                return (
                                  <li key={item.id} role="none">
                                    <button
                                      type="button"
                                      id={`${listboxId}-${item.id}`}
                                      role="option"
                                      aria-selected={active}
                                      onMouseEnter={() => setActiveIndex(index)}
                                      onClick={() => runCommand(item)}
                                      className={clsx(
                                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start transition-colors",
                                        active
                                          ? "bg-accent text-accent-foreground"
                                          : "text-foreground hover:bg-muted/70",
                                        item.danger && !active && "text-rose-600",
                                        item.danger && active && "text-rose-600",
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                                          active ? "bg-background/70" : "bg-muted",
                                        )}
                                      >
                                        <HugeiconsIcon
                                          icon={item.icon}
                                          size={16}
                                        />
                                      </span>
                                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                        {item.label}
                                      </span>
                                      {item.shortcut ? (
                                        <kbd
                                          dir="ltr"
                                          className="shrink-0 rounded-md border border-border/80 bg-background/60 px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground"
                                        >
                                          {item.shortcut}
                                        </kbd>
                                      ) : null}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
                      <span>
                        {toFaDigits(flat.length)} دستور
                        {query ? " مطابق" : ""}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span dir="ltr">↑↓</span>
                        <span>جابه‌جایی</span>
                        <span className="opacity-40">·</span>
                        <span dir="ltr">↵</span>
                        <span>اجرا</span>
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
