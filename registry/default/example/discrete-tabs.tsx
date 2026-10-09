"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { motion, MotionConfig } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Mail01Icon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

// Change Here
const TABS = [
  { id: "Inbox", title: "صندوق", icon: Mail01Icon },
  { id: "Planner", title: "برنامه‌ریز", icon: Calendar03Icon },
  { id: "Alerts", title: "هشدارها", icon: Notification03Icon },
] as const;

const ROW_EASE: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

export default function DiscreteTabs() {
  const [activeButton, setActiveButton] = useState<string>(TABS[0].id);

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="تب‌های فشرده"
      className="flex items-center justify-center gap-3 fill-muted-foreground/70 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <MotionConfig
        transition={{ type: "spring", duration: 0.85, bounce: 0.35 }}
      >
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            title={tab.title}
            icon={tab.icon}
            isActive={activeButton === tab.id}
            setActiveButton={setActiveButton}
          />
        ))}
      </MotionConfig>
    </section>
  );
}

function TabButton({
  id,
  title,
  icon,
  isActive,
  setActiveButton,
}: {
  id: string;
  title: string;
  icon: (typeof TABS)[number]["icon"];
  isActive: boolean;
  setActiveButton: Dispatch<SetStateAction<string>>;
}) {
  return (
    <motion.button
      type="button"
      layout
      transition={{
        layout: {
          type: "spring",
          bounce: 0.2,
          duration: 0.55,
          ease: ROW_EASE,
        },
      }}
      onClick={() => setActiveButton(id)}
      aria-pressed={isActive}
      aria-label={title}
      className={clsx(
        "flex h-14 cursor-pointer items-center gap-x-3 overflow-hidden border border-border outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-card px-5 text-foreground"
          : "bg-background px-4 text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
      style={{ borderRadius: isActive ? 20 : 40, borderWidth: 1 }}
    >
      <motion.span layout className="shrink-0">
        <HugeiconsIcon icon={icon} size={24} />
      </motion.span>

      {isActive ? (
        <motion.span
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            bounce: 0.1,
            duration: 0.25,
            ease: ROW_EASE,
          }}
          className="whitespace-nowrap text-xl"
        >
          {title}
        </motion.span>
      ) : null}
    </motion.button>
  );
}
