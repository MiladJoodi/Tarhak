"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "../../../components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  UnfoldMoreIcon,
  Album02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

interface PlaceholderConfig {
  id: number;
  placeholder: string;
  icon: any;
}

// Change Here
const placeholderOptions: PlaceholderConfig[] = [
  { id: 1, placeholder: "هر چیزی جستجو کنید...", icon: SparklesIcon },
  { id: 2, placeholder: "تولید تصویر", icon: Album02Icon },
];

/** Whole-string / word stagger — never per-glyph: Arabic/Persian joining breaks in inline-block letters. */
const AnimatedPlaceholder = ({ text }: { text: string }) => {
  const parts = text.split(/(\s+)/).filter((part) => part.length > 0);

  return (
    <span className="inline">
      {parts.map((part, index) => {
        const isSpace = /^\s+$/.test(part);
        return (
          <motion.span
            key={`${index}-${part}`}
            initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: 0.04 * index,
              duration: 0.2,
              ease: [0.32, 0.72, 0, 1],
            }}
            className={isSpace ? "inline" : "inline-block"}
          >
            {isSpace ? "\u00A0".repeat(part.length) : part}
          </motion.span>
        );
      })}
    </span>
  );
};

const InputSwitch = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const currentConfig = placeholderOptions[activeIndex];

  const handleIconClick = () => {
    setActiveIndex((prev) => (prev + 1) % placeholderOptions.length);
  };

  const IconComponent = currentConfig.icon;

  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex w-full max-w-sm items-center justify-center overflow-hidden rounded-full bg-muted px-1 py-1 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <motion.button
        type="button"
        className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-full bg-background p-2.5 shadow-sm"
        onClick={handleIconClick}
        whileTap={{ scale: 0.96 }}
      >
        <span className="relative size-5 shrink-0 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={currentConfig.id}
              initial={{ opacity: 0, scale: 0.85, filter: "blur(3px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.85, filter: "blur(3px)" }}
              transition={{ type: "spring", duration: 0.25, bounce: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <HugeiconsIcon
                icon={IconComponent}
                className="size-5 text-foreground"
              />
            </motion.span>
          </AnimatePresence>
        </span>
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          className="size-3 shrink-0 text-muted-foreground"
        />
      </motion.button>
      <div className="relative min-w-0 flex-1">
        {!inputValue && (
          <div className="pointer-events-none absolute inset-y-0 start-0 flex w-full items-center overflow-hidden ps-1.5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={currentConfig.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                className="block overflow-hidden whitespace-nowrap text-sm text-muted-foreground"
              >
                <AnimatedPlaceholder text={currentConfig.placeholder} />
              </motion.span>
            </AnimatePresence>
          </div>
        )}
        <Input
          type="text"
          value={inputValue}
          onChange={(e: any) => setInputValue(e.target.value)}
          className="m-0 !border-0 border-none bg-transparent! !ps-1.5 text-sm text-foreground outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <button className="flex cursor-pointer items-center justify-center self-stretch rounded-full bg-background px-3 py-2.5 shadow-sm transition-transform duration-150 ease-in-out active:scale-95">
        <HugeiconsIcon
          icon={ArrowLeft02Icon}
          className="h-4 w-4 text-foreground"
        />
      </button>
    </div>
  );
};

export default InputSwitch;
