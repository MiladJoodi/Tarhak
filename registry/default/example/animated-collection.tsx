"use client";

import React, { useState } from "react";
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  type Transition,
} from "motion/react";
import {
  Playlist01Icon,
  GridViewIcon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  idNumber: string;
  image: string;
}

const ITEMS: CollectionItem[] = [
  {
    id: "1",
    title: "افق‌های سینمایی",
    subtitle: "عکاسی",
    idNumber: "۲۰۹",
    image:
      "/unsplash/1506744038136-46273834b3fb.webp",
  },
  {
    id: "2",
    title: "رؤیاهای انتزاعی",
    subtitle: "هنر دیجیتال",
    idNumber: "۸۰۸",
    image:
      "/unsplash/1541701494587-cb58502866ab.webp",
  },
];

type ViewMode = "list" | "card" | "pack";

const snappySpring: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 1,
};

const fadeMeta: Transition = {
  duration: 0.16,
  ease: [0.16, 1, 0.3, 1],
};

const PACK_POSE = [
  { rotate: -11, x: -22, y: 6 },
  { rotate: 9, x: 24, y: -8 },
] as const;

export default function AnimatedCollection() {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div
      dir="rtl"
      lang="fa"
      className="mx-auto w-full max-w-xl p-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal antialiased [-webkit-font-smoothing:antialiased] selection:bg-foreground/10 md:p-8"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-balance text-xl font-medium text-foreground">
              مجموعهٔ من
            </h2>
            <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
              {ITEMS.length.toLocaleString("fa-IR")} مورد
            </span>
          </div>

          <LayoutGroup id="ac-tabs">
            <div
              role="tablist"
              aria-label="چیدمان مجموعه"
              className="flex w-fit rounded-full bg-muted/70 p-1 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            >
              <Tab
                active={view === "list"}
                onClick={() => setView("list")}
                icon={Playlist01Icon}
                label="فهرست"
              />
              <Tab
                active={view === "card"}
                onClick={() => setView("card")}
                icon={GridViewIcon}
                label="کارت"
              />
              <Tab
                active={view === "pack"}
                onClick={() => setView("pack")}
                icon={Layers01Icon}
                label="بسته"
              />
            </div>
          </LayoutGroup>
        </div>

        <div className="h-px w-full bg-border" />

        <div className="relative min-h-[360px]">
          <LayoutGroup id="ac-items">
            <motion.div
              layout
              initial={false}
              transition={snappySpring}
              className={cn(
                "relative w-full",
                view === "list" && "flex flex-col gap-3",
                view === "card" && "grid grid-cols-2 gap-4",
                view === "pack" &&
                  "absolute inset-x-0 top-0 bottom-16 flex items-center justify-center"
              )}
            >
              {ITEMS.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={false}
                  transition={snappySpring}
                  className={cn(
                    "relative z-10 flex items-center",
                    view === "list" && "w-full gap-4",
                    view === "card" && "w-full flex-col items-start gap-3",
                    view === "pack" &&
                      "absolute size-52 items-center justify-center"
                  )}
                  style={{
                    zIndex: view === "pack" ? ITEMS.length - index : 1,
                  }}
                  animate={
                    view === "pack"
                      ? PACK_POSE[index] ?? { rotate: 0, x: 0, y: 0 }
                      : { rotate: 0, x: 0, y: 0 }
                  }
                >
                  <motion.div
                    layout
                    initial={false}
                    transition={snappySpring}
                    className={cn(
                      "relative shrink-0 overflow-hidden bg-muted outline outline-1 outline-black/10 dark:outline-white/10",
                      view === "list" && "size-16 rounded-2xl",
                      view === "card" &&
                        "aspect-square w-full rounded-[1.5rem] shadow-[0_1px_1px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
                      view === "pack" &&
                        "size-full rounded-[1.75rem] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_18px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_18px_40px_rgba(0,0,0,0.45)]"
                    )}
                  >
                    <motion.img
                      layout
                      initial={false}
                      transition={snappySpring}
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={400}
                      className={cn(
                        "pointer-events-none m-0! block size-full object-cover p-0! select-none",
                        view === "list" && "rounded-2xl",
                        view === "card" && "rounded-[1.5rem]",
                        view === "pack" && "rounded-[1.75rem]"
                      )}
                    />
                  </motion.div>

                  <AnimatePresence mode="popLayout" initial={false}>
                    {view !== "pack" && (
                      <motion.div
                        key={`${item.id}-info`}
                        layout
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(4px)" }}
                        transition={fadeMeta}
                        className={cn(
                          "min-w-0 flex-1",
                          view === "card" && "w-full px-0.5"
                        )}
                      >
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <h3 className="truncate text-[15px] font-medium leading-tight text-foreground">
                            {item.title}
                          </h3>
                          <p className="m-0 truncate text-xs text-muted-foreground">
                            {item.subtitle}
                            <span className="tabular-nums"> · {item.idNumber}</span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </LayoutGroup>

          <AnimatePresence initial={false}>
            {view === "pack" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fadeMeta}
                className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-1 text-center"
              >
                <p className="m-0 max-w-[28ch] text-balance text-sm font-medium text-foreground">
                  {ITEMS.map((item) => item.title).join(" · ")}
                </p>
                <p className="m-0 text-xs tabular-nums text-muted-foreground">
                  {ITEMS.length.toLocaleString("fa-IR")} اثر
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Playlist01Icon;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative flex h-10 min-w-[5.75rem] cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-medium outline-none transition-[color,background-color,box-shadow,transform] duration-150 ease-out",
        "active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-foreground/25",
        active
          ? "text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {active && (
        <motion.div
          layoutId="ac-active-tab"
          className="pointer-events-none absolute inset-0 rounded-full bg-primary shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
          transition={snappySpring}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <HugeiconsIcon icon={icon} size={15} strokeWidth={2} />
        {label}
      </span>
    </button>
  );
}
