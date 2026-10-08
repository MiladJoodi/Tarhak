"use client";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import {
  InboxIcon,
  Message01Icon,
  PaintBoardIcon,
  Tag01Icon,
  Image01Icon,
  Archive02Icon,
  ArrowReloadHorizontalIcon,
  Delete02Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import useMeasure from "@/hooks/use-measure";

const ICON_SIZE = 24;

// Change Here
const primaryTools = [
  { icon: InboxIcon, label: "صندوق" },
  { icon: Message01Icon, label: "پیام‌ها" },
  { icon: PaintBoardIcon, label: "نقاشی" },
  { icon: Tag01Icon, label: "برچسب‌ها", blur: true },
];

const secondaryTools = [
  { icon: Image01Icon, label: "تصویر", blur: true },
  { icon: Archive02Icon, label: "آرشیو" },
  {
    icon: ArrowReloadHorizontalIcon,
    label: "بارگذاری مجدد",
    className: "-scale-x-100",
  },
  {
    icon: ArrowReloadHorizontalIcon,
    label: "بارگذاری مجدد",
    className: "-scale-x-100",
  },
  { icon: Delete02Icon, label: "حذف", className: "text-red-500" },
];

function ToolbarButton({
  icon,
  label,
  size = ICON_SIZE,
  blur = false,
  isBlurred = false,
  className = "",
}: {
  icon: any;
  label: string;
  size?: number;
  blur?: boolean;
  isBlurred?: boolean;
  className?: string;
}) {
  const iconElement = (
    <HugeiconsIcon
      icon={icon}
      className={`text-foreground ${className}`}
      width={size}
      height={size}
    />
  );

  if (blur) {
    return (
      <button
        type="button"
        aria-label={label}
        className="rounded-md p-1 transition-colors hover:cursor-pointer hover:bg-accent/50"
      >
        <motion.div
          initial={{ filter: "blur(0px)" }}
          animate={{ filter: isBlurred ? "blur(1px)" : "blur(0px)" }}
        >
          {iconElement}
        </motion.div>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      className="rounded-md p-1 transition-colors hover:cursor-pointer hover:bg-accent/50"
    >
      {iconElement}
    </button>
  );
}

function DynamicToolbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [primaryRef, primaryBounds] = useMeasure();
  const [secondaryRef, secondaryBounds] = useMeasure();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentWidth = isExpanded ? secondaryBounds.width : primaryBounds.width;
  const hasMeasurements = primaryBounds.width > 0;

  const initialWidth = hasMeasurements ? primaryBounds.width : "auto";

  const springTransition = {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
    mass: 0.8,
    bounce: 0.9,
    duration: isExpanded ? 0.4 : 1.2,
    delay: isExpanded ? 0 : 0.015,
  };

  return (
    // LTR shell keeps measured horizontal slide intact.
    <motion.div
      dir="ltr"
      className="relative h-14 overflow-hidden rounded-full border border-border bg-muted"
      initial={{ width: initialWidth }}
      animate={
        hasMeasurements ? { width: currentWidth } : { width: initialWidth }
      }
      transition={isMounted ? springTransition : { duration: 0 }}
    >
      <motion.div
        className="flex h-full"
        initial={false}
        animate={{ x: isExpanded ? -primaryBounds.width : 0 }}
        transition={isMounted ? springTransition : { duration: 0 }}
      >
        {/* Primary Tools Panel */}
        <div
          ref={primaryRef as React.RefObject<HTMLDivElement>}
          className="flex flex-shrink-0 items-center gap-1 p-1.5 ps-3 pe-2"
        >
          {primaryTools.map((item, index) => (
            <ToolbarButton
              key={index}
              icon={item.icon}
              label={item.label}
              blur={item.blur}
              isBlurred={isExpanded}
            />
          ))}
          <motion.button
            type="button"
            aria-label="ابزارهای بیشتر"
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className="flex aspect-square h-full items-center justify-center rounded-full bg-background"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="text-muted-foreground"
              width={24}
              height={24}
            />
          </motion.button>
        </div>

        {/* Secondary Tools Panel */}
        <div
          ref={secondaryRef as React.RefObject<HTMLDivElement>}
          className="flex flex-shrink-0 items-center gap-1 p-1.5 ps-2 pe-3"
          style={{
            position: isExpanded ? "relative" : "absolute",
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
          }}
        >
          <motion.button
            type="button"
            aria-label="بازگشت به ابزارهای اصلی"
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(false)}
            className="flex aspect-square h-full items-center justify-center rounded-full bg-background"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="text-muted-foreground"
              width={24}
              height={24}
            />
          </motion.button>
          {secondaryTools.map((item, index) => (
            <ToolbarButton
              key={index}
              icon={item.icon}
              label={item.label}
              blur={item.blur}
              isBlurred={!isExpanded}
              className={item.className}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DynamicToolbarExample() {
  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full min-h-[200px] w-full items-center justify-center font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <DynamicToolbar />
    </div>
  );
}
