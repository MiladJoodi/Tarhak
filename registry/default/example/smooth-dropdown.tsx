"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import useMeasure from "react-use-measure";
import {
  UserIcon,
  CreditCardIcon,
  FolderIcon,
  File01Icon,
  SettingsIcon,
  HelpCircleIcon,
  LogoutIcon,
  MoreHorizontalCircle01Icon,
} from "@hugeicons/core-free-icons";

// Change Here
const menuItems = [
  { id: "profile", label: "پروفایل", icon: UserIcon },
  { id: "upgrade", label: "ارتقا حساب", icon: CreditCardIcon },
  { id: "projects", label: "پروژه‌ها", icon: FolderIcon },
  { id: "documentation", label: "مستندات", icon: File01Icon },
  { id: "divider", label: "", icon: null },
  { id: "settings", label: "تنظیمات", icon: SettingsIcon },
  { id: "help", label: "راهنما", icon: HelpCircleIcon },
  { id: "logout", label: "خروج", icon: LogoutIcon },
];

const easeOutQuint: [number, number, number, number] = [0.23, 1, 0.32, 1];

/** Open menu width — room for Persian labels without wrapping. */
const OPEN_WIDTH = 248;

export default function SmoothDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("profile");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lock the tallest measured height while open so shared-element hover
  // (especially across the divider) cannot shrink the shell and spring it up.
  // Adjust peak during render (React-supported) — not in an effect / ref.
  const [contentRef, contentBounds] = useMeasure({ offsetSize: true });
  const measuredHeight = Math.max(40, Math.ceil(contentBounds.height));
  const [peakHeight, setPeakHeight] = useState(40);
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setPeakHeight(40);
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

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const openHeight = isOpen ? Math.max(measuredHeight, peakHeight) : 40;

  return (
    <div
      ref={containerRef}
      dir="rtl"
      lang="fa"
      className="relative h-10 w-10 not-prose font-sans tracking-normal"
    >
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? OPEN_WIDTH : 40,
          height: isOpen ? openHeight : 40,
          borderRadius: isOpen ? 14 : 12,
        }}
        transition={{
          width: { type: "spring", damping: 34, stiffness: 380, mass: 0.8 },
          height: { type: "spring", damping: 34, stiffness: 380, mass: 0.8 },
          borderRadius: { duration: 0.2 },
        }}
        role="button"
        tabIndex={isOpen ? -1 : 0}
        aria-label={isOpen ? undefined : "باز کردن منو"}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="absolute top-0 end-0 bg-popover border border-border shadow-lg overflow-hidden cursor-pointer origin-top-end outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          style={{
            pointerEvents: isOpen ? "none" : "auto",
            willChange: "transform",
          }}
        >
          <HugeiconsIcon
            icon={MoreHorizontalCircle01Icon}
            className="w-6 h-6 text-muted-foreground"
          />
        </motion.div>

        {/* Menu Content - visible when open */}
        <div ref={contentRef}>
          <motion.div
            layoutRoot
            initial={false}
            animate={{
              opacity: isOpen ? 1 : 0,
            }}
            transition={{
              duration: 0.2,
              delay: isOpen ? 0.08 : 0,
            }}
            className="p-2"
            style={{
              pointerEvents: isOpen ? "auto" : "none",
              willChange: "opacity",
            }}
            role="menu"
            aria-label="منوی حساب"
          >
            <ul
              className="flex flex-col gap-0.5 m-0! p-0! list-none!"
              onMouseLeave={() => setHoveredItem(null)}
            >
              {menuItems.map((item, index) => {
                if (item.id === "divider") {
                  return (
                    <motion.hr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isOpen ? 1 : 0 }}
                      transition={{ delay: isOpen ? 0.12 + index * 0.015 : 0 }}
                      // Ignore pointer so hover does not clear and snap the
                      // indicator back to the active row at the top.
                      className="pointer-events-none border-border my-1.5!"
                    />
                  );
                }

                const iconRef = item.icon!;
                const isActive = activeItem === item.id;
                const isLogout = item.id === "logout";
                const showIndicator = hoveredItem
                  ? hoveredItem === item.id
                  : isActive;

                const itemDuration = item.id === "logout" ? 0.12 : 0.15;
                const itemDelay = isOpen ? 0.06 + index * 0.02 : 0;

                return (
                  <motion.li
                    key={item.id}
                    role="menuitem"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{
                      opacity: isOpen ? 1 : 0,
                      x: isOpen ? 0 : -8,
                    }}
                    transition={{
                      delay: itemDelay,
                      duration: itemDuration,
                      ease: easeOutQuint,
                    }}
                    onClick={() => {
                      setActiveItem(item.id);
                      if (item.id === "logout") {
                        setIsOpen(false);
                      }
                    }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    className={`relative flex items-center gap-3 rounded-lg text-sm leading-normal cursor-pointer transition-colors duration-200 ease-out m-0! ps-3! pe-2! py-2! ${
                      isLogout && showIndicator
                        ? "text-red-600 dark:text-red-400"
                        : isActive
                          ? "text-foreground"
                          : isLogout
                            ? "text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {showIndicator && (
                      <motion.div
                        layoutId="smoothDropdownActive"
                        className={`absolute inset-0 rounded-lg ${
                          isLogout
                            ? "bg-red-500/10"
                            : "bg-muted"
                        }`}
                        transition={{
                          type: "spring",
                          damping: 30,
                          stiffness: 520,
                          mass: 0.8,
                        }}
                      />
                    )}
                    {showIndicator && (
                      <motion.div
                        layoutId="smoothDropdownBar"
                        className={`absolute start-0 top-0 bottom-0 my-auto w-[3px] h-5 rounded-full ${
                          isLogout ? "bg-red-500" : "bg-foreground"
                        }`}
                        transition={{
                          type: "spring",
                          damping: 30,
                          stiffness: 520,
                          mass: 0.8,
                        }}
                      />
                    )}
                    <HugeiconsIcon
                      icon={iconRef}
                      className={`w-[18px] h-[18px] relative z-10 shrink-0${
                        isLogout ? " -scale-x-100" : ""
                      }`}
                    />
                    <span className="font-medium relative z-10 tracking-normal">
                      {item.label}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
