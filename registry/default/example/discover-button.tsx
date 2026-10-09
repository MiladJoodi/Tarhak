"use client";

import { useState } from "react";
import { motion } from "motion/react";

import {
  Search01Icon,
  FavouriteIcon,
  Fire02Icon,
  MultiplicationSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const TABS = [
  {
    id: "popular",
    label: "محبوب",
    icon: Fire02Icon,
    color: "text-red-500",
    fill: "fill-red-500",
    bg: "bg-red-50",
  },
  {
    id: "favorites",
    label: "علاقه‌مندی‌ها",
    icon: FavouriteIcon,
    color: "text-gray-900",
    fill: "fill-gray-900",
    bg: "bg-gray-100",
  },
] as const;

const spring = {
  type: "spring" as const,
  damping: 22,
  stiffness: 260,
  mass: 1,
};

export default function DiscoverButton() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>(
    TABS[0].id,
  );
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full min-w-0 items-center justify-center px-3 py-8 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal md:p-6"
    >
      <div className="flex h-14 w-full max-w-[22rem] items-center gap-2 sm:h-[60px] sm:max-w-md sm:gap-3">
        {/* Search — fixed height; expands only in width */}
        <motion.button
          type="button"
          aria-label={isSearchExpanded ? undefined : "باز کردن جستجو"}
          aria-expanded={isSearchExpanded}
          transition={spring}
          animate={{
            flexGrow: isSearchExpanded ? 1 : 0,
            flexBasis: isSearchExpanded ? "0%" : "56px",
            width: isSearchExpanded ? "auto" : 56,
          }}
          onClick={() => {
            if (!isSearchExpanded) setIsSearchExpanded(true);
          }}
          className="relative flex h-14 shrink-0 cursor-pointer items-center overflow-hidden rounded-full bg-white px-4 shadow-lg sm:h-[60px] sm:px-[1.125rem]"
          style={{ minWidth: 56, maxWidth: "100%" }}
        >
          <HugeiconsIcon
            icon={Search01Icon}
            className="size-5 shrink-0 text-gray-800 sm:size-6"
          />

          <motion.div
            initial={false}
            animate={{
              width: isSearchExpanded ? "100%" : 0,
              opacity: isSearchExpanded ? 1 : 0,
              marginInlineStart: isSearchExpanded ? 10 : 0,
            }}
            transition={spring}
            className="flex min-w-0 items-center overflow-hidden"
          >
            {isSearchExpanded ? (
              <input
                type="search"
                placeholder="جستجو"
                aria-label="جستجو"
                autoFocus
                className="w-full min-w-0 border-0 bg-transparent text-base outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsSearchExpanded(false);
                }}
              />
            ) : null}
          </motion.div>
        </motion.button>

        {/* Tabs / close — always one horizontal pill */}
        <motion.div
          transition={spring}
          animate={{
            width: isSearchExpanded ? 56 : "auto",
            minWidth: isSearchExpanded ? 56 : undefined,
          }}
          className="relative flex h-14 shrink-0 items-center overflow-hidden rounded-full bg-white shadow-lg sm:h-[60px]"
        >
          <motion.div
            initial={false}
            animate={{
              opacity: isSearchExpanded ? 0 : 1,
              filter: isSearchExpanded ? "blur(4px)" : "blur(0px)",
            }}
            transition={{ duration: 0.18 }}
            className="flex h-full items-center gap-0.5 px-1 sm:gap-1 sm:px-1.5"
            style={{ pointerEvents: isSearchExpanded ? "none" : "auto" }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex h-11 items-center gap-1.5 rounded-full px-3 transition-colors sm:h-12 sm:gap-2 sm:px-5 ${
                  activeTab === tab.id ? tab.color : "text-gray-700"
                }`}
              >
                {activeTab === tab.id ? (
                  <motion.span
                    layoutId="discover-bubble"
                    className={`absolute inset-0 z-0 ${tab.bg} rounded-full`}
                    transition={{ type: "spring", bounce: 0.19, duration: 0.4 }}
                  />
                ) : null}
                <HugeiconsIcon
                  icon={tab.icon}
                  className={`relative z-10 size-4 sm:size-5 ${
                    activeTab === tab.id ? tab.fill : ""
                  }`}
                />
                <span className="relative z-10 text-sm font-semibold whitespace-nowrap sm:text-base">
                  {tab.label}
                </span>
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={false}
            animate={{
              opacity: isSearchExpanded ? 1 : 0,
              filter: isSearchExpanded ? "blur(0px)" : "blur(4px)",
            }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ pointerEvents: isSearchExpanded ? "auto" : "none" }}
          >
            <button
              type="button"
              aria-label="بستن جستجو"
              onClick={() => setIsSearchExpanded(false)}
              className="flex size-full cursor-pointer items-center justify-center"
            >
              <HugeiconsIcon
                icon={MultiplicationSignIcon}
                className="size-5 text-gray-800 sm:size-6"
              />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
