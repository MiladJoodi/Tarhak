"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";

export function SaveButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = () => {
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    }, 2500);
  };

  const text = useMemo(() => {
    switch (status) {
      case "idle":
        return "ذخیره";
      case "loading":
        return "ذخیره…";
      case "success":
        return "ذخیره شد";
    }
  }, [status]);

  return (
    <div
      dir="rtl"
      lang="fa"
      className="relative inline-flex group font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <Button
        onClick={handleClick}
        className={cn(
          "relative h-12 min-w-[140px] rounded-full px-8 text-base font-medium transition-all duration-300 disabled:opacity-100",
          status === "idle"
            ? "transition-colors"
            : "cursor-not-allowed border-border bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary dark:border-white/10 dark:bg-[hsl(225_8%_18%)] dark:text-neutral-200 dark:hover:bg-[hsl(225_8%_20%)]"
        )}
        variant={"default"}
        disabled={status !== "idle"}
      >
        <span className="relative flex min-h-[1.25em] items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status}
              layout
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 1,
              }}
              className="inline-block whitespace-nowrap"
            >
              {text}
            </motion.span>
          </AnimatePresence>
        </span>
      </Button>

      {/* Status Indicator */}
      <div className={cn("absolute -top-1 -end-1 z-10 pointer-events-none")}>
        <AnimatePresence mode="wait">
          {status !== "idle" && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: -8, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0, x: -8, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn(
                "flex size-6 items-center justify-center overflow-visible rounded-full ring-3",
                status === "success"
                  ? "bg-primary text-primary-foreground ring-background"
                  : "bg-secondary text-secondary-foreground ring-background dark:bg-zinc-700 dark:text-zinc-100"
              )}
            >
              <AnimatePresence mode="popLayout">
                {status === "loading" && (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
                        opacity=".5"
                      />
                      <path
                        fill="currentColor"
                        d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"
                        // className="animate-spin"
                      >
                        <animateTransform
                          attributeName="transform"
                          dur="1s"
                          from="0 12 12"
                          repeatCount="indefinite"
                          to="360 12 12"
                          type="rotate"
                        />
                      </path>
                    </svg>
                  </motion.div>
                )}
                {status === "success" && (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0, filter: "blur(4px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    exit={{ scale: 0, opacity: 0, filter: "blur(4px)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <HugeiconsIcon icon={Tick02Icon} className="size-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SaveButtonDemo() {
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      <SaveButton />
    </div>
  );
}
