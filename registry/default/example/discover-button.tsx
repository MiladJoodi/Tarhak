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

// Change Here
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

export default function DiscoverButton() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>(
    TABS[0].id
  );
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full flex-col items-center gap-3 p-2 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal md:flex-row"
    >
      {/* Search Button / Input */}
      <motion.div
        layout
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 230,
          mass: 1.2,
        }}
        onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
        className={`relative flex h-[60px] cursor-pointer items-center overflow-hidden rounded-[3rem] bg-white px-[1.125rem] py-2 shadow-lg ${
          isSearchExpanded ? "flex-1" : ""
        }`}
      >
        <div className="shrink-0">
          <HugeiconsIcon
            icon={Search01Icon}
            className="h-6 w-6 text-gray-800"
          />
        </div>

        <motion.div
          initial={false}
          animate={{
            width: isSearchExpanded ? "auto" : "0px",
            opacity: isSearchExpanded ? 1 : 0,
            filter: isSearchExpanded ? "blur(0px)" : "blur(4px)",
            marginInlineStart: isSearchExpanded ? "12px" : "0px",
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 230,
            mass: 1.2,
          }}
          className="-mb-0.5 flex items-center overflow-hidden"
        >
          <input
            type="text"
            placeholder="جستجو"
            aria-label="جستجو"
            className="w-full border-0 bg-transparent text-lg outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      </motion.div>

      {/* Tab Container / Close Button */}
      <motion.div
        layout
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 230,
          mass: 1.2,
        }}
        className={`relative flex items-center overflow-hidden rounded-[20px] bg-white shadow-lg md:rounded-[3rem] ${isSearchExpanded ? `h-[60px]` : `h-[120px]`} md:h-[60px]`}
      >
        {/* Wrapper to control clipping */}
        <motion.div
          initial={false}
          animate={{
            width: isSearchExpanded ? "60px" : "auto",
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 230,
            mass: 1.2,
          }}
          className="relative flex h-full items-center overflow-hidden"
        >
          {/* Tabs Group - stays in place, gets clipped */}
          <motion.div
            initial={false}
            animate={{
              opacity: isSearchExpanded ? 0 : 1,
              filter: isSearchExpanded ? "blur(4px)" : "blur(0px)",
              width: "auto",
            }}
            transition={{
              duration: 0.2,
            }}
            className="flex items-center whitespace-nowrap"
          >
            <div className="flex flex-col items-center gap-2 px-2 md:flex-row md:px-[6px]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex w-full items-center gap-2 rounded-2xl px-7 py-3 transition-colors md:rounded-[3rem] md:px-6 ${
                    activeTab === tab.id ? tab.color : "text-gray-700"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="bubble"
                      className={`absolute inset-0 z-0 ${tab.bg} rounded-[12px] md:rounded-[9999]`}
                      transition={{
                        type: "spring",
                        bounce: 0.19,
                        duration: 0.4,
                      }}
                    />
                  )}
                  <HugeiconsIcon
                    icon={tab.icon}
                    className={`relative z-10 h-5 w-5 ${
                      activeTab === tab.id ? tab.fill : ""
                    }`}
                  />
                  <span className="relative z-10 font-semibold">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Close Button - positioned absolutely on top */}
          <motion.div
            initial={false}
            animate={{
              opacity: isSearchExpanded ? 1 : 0,
              filter: isSearchExpanded ? "blur(0px)" : "blur(4px)",
            }}
            transition={{
              duration: 0.2,
            }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ pointerEvents: isSearchExpanded ? "auto" : "none" }}
          >
            <button
              type="button"
              aria-label="بستن جستجو"
              onClick={() => setIsSearchExpanded(false)}
              className="shrink-0 cursor-pointer"
            >
              <HugeiconsIcon
                icon={MultiplicationSignIcon}
                className="h-6 w-6 text-gray-800"
              />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
