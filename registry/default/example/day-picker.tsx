"use client";
import {
  Tick02Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

const days = ["ی", "د", "س", "چ", "پ", "ج", "ش"];
type options = "روزانه" | "هفتگی" | "ماهانه" | "سالانه";
// Change Here
const options: options[] = ["روزانه", "هفتگی", "ماهانه", "سالانه"];

const springTransition = {
  type: "spring",
  damping: 30,
  stiffness: 400,
  mass: 1,
} as const;

export default function DayPicker() {
  const [day, setDay] = useState(1);
  const [option, setOption] = useState<options>("روزانه");
  const [isOptionOpen, setisOptionOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(true);

  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full items-center justify-center font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-sm font-medium tracking-normal"
    >
      <motion.div
        layout
        transition={springTransition}
        className="flex w-full max-w-xs flex-col gap-1.5 overflow-hidden rounded-3xl bg-muted p-1.5 shadow-lg"
      >
        <div className="relative flex items-center justify-between">
          <motion.div
            layout
            animate={{
              filter: isOptionOpen ? "blur(8px)" : "blur(0px)",
            }}
            transition={springTransition}
            className="flex h-full items-center justify-center px-3 py-2 text-muted-foreground "
          >
            تکرار
          </motion.div>
          {isOptionOpen ? (
            <div className="absolute flex h-full w-full justify-between gap-2 p-0">
              <motion.div className="relative flex w-full items-center justify-between rounded-3xl ">
                <motion.div
                  layout
                  transition={springTransition}
                  layoutId="options"
                  className="absolute h-full w-full rounded-3xl bg-background"
                ></motion.div>

                <div className="flex justify-between px-1">
                  {options.map((op) => {
                    return (
                      <motion.div
                        key={op}
                        layout
                        initial={{
                          filter: "blur(8px)",
                          opacity: 0,
                        }}
                        animate={{
                          filter: "blur(0px)",
                          opacity: 1,
                        }}
                        onClick={() => {
                          setOption(op);
                          setIsSelectorOpen(true);
                        }}
                        className={cn(
                          "relative cursor-pointer rounded-[24px] px-2 py-1 text-muted-foreground transition-colors duration-300",
                          option === op && "text-foreground"
                        )}
                      >
                        {option === op && (
                          <motion.div
                            layoutId="optionToSelect"
                            transition={springTransition}
                            className="absolute inset-0 h-full w-full rounded-3xl bg-secondary"
                          ></motion.div>
                        )}
                        <span className="relative z-10">{op}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
              <AnimatePresence>
                <motion.div
                  key="check-button"
                  layoutId="button"
                  onClick={() => {
                    setisOptionOpen(false);
                    setIsSelectorOpen(false);
                  }}
                  initial={{
                    filter: "blur(1px)",
                    opacity: 0.6,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                  }}
                  exit={{
                    filter: "blur(1px)",
                    opacity: 0.6,
                  }}
                  transition={springTransition}
                  style={{ borderRadius: 24 }}
                  className="flex h-full cursor-pointer items-center justify-center bg-primary px-[10px] text-primary-foreground"
                >
                  <HugeiconsIcon icon={Tick02Icon} size={16} />
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              onClick={() => setisOptionOpen(true)}
              className="relative flex w-fit cursor-pointer items-center gap-0 rounded-full p-0 px-0"
            >
              <motion.div
                layout
                transition={springTransition}
                layoutId="options"
                className="absolute h-full w-full rounded-[24px] bg-background"
              ></motion.div>
              <motion.div
                initial={false}
                className="relative cursor-default py-0 ps-3 text-foreground"
                layoutId={option}
              >
                {option === "هفتگی" ? option + "، " + days[day] : option}
              </motion.div>
              <AnimatePresence initial={false}>
                <motion.div
                  key="code-icon"
                  layoutId="button"
                  className="flex h-fit w-fit items-center justify-center px-3 py-[10px] ps-2 text-muted-foreground"
                >
                  <HugeiconsIcon
                    icon={UnfoldMoreIcon}
                    size={14}
                    className="-rotate-90"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </div>
        <AnimatePresence mode="popLayout">
          {isSelectorOpen && option === "هفتگی" && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
                filter: "blur(8px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                y: -10,
                filter: "blur(8px)",
              }}
              transition={springTransition}
              className="flex justify-between overflow-hidden rounded-full bg-background px-2 py-1 text-muted-foreground"
            >
              {days.map((d, index) => {
                return (
                  <motion.div
                    key={d}
                    layout
                    initial={{
                      filter: "blur(8px)",
                      opacity: 0,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                    }}
                    exit={{
                      filter: "blur(8px)",
                      opacity: 0,
                    }}
                    transition={{
                      ...springTransition,
                      delay: index * 0.03,
                    }}
                    onClick={() => setDay(index)}
                    className={cn(
                      "relative cursor-pointer rounded-3xl px-2 py-1 transition-colors duration-300",
                      index === day
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <span className="relative z-10">{d}</span>
                    {index === day && (
                      <motion.div
                        transition={springTransition}
                        layoutId="dayOptions"
                        className="absolute inset-0 h-full w-full rounded-3xl bg-secondary "
                      ></motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
