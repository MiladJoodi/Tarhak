"use client";
import { motion, MotionConfig } from "motion/react";
import { Dispatch, SetStateAction, useState } from "react";
import clsx from "clsx";

import {
  Appointment01Icon,
  BalloonsIcon,
  GoogleMapsIcon,
  ZoomIcon,
  ReminderIcon,
  TaskDaily01Icon,
  Tick02Icon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type FilterKey = (typeof filterKeys)[number];

// Change Here
export const filterKeys = [
  {
    name: "tasks",
    label: "وظایف",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={TaskDaily01Icon} size={size} />
    ),
  },
  {
    name: "events",
    label: "رویدادها",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={GoogleMapsIcon} size={size} />
    ),
  },
  {
    name: "reminders",
    label: "یادآورها",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={ReminderIcon} size={size} />
    ),
  },
  {
    name: "appointments",
    label: "قرارها",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={Appointment01Icon} size={size} />
    ),
  },
  {
    name: "meetings",
    label: "جلسات",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={ZoomIcon} size={size} />
    ),
  },
  {
    name: "celebrations",
    label: "جشن‌ها",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={BalloonsIcon} size={size} />
    ),
  },
];

function ListItem(props: {
  index: number;
  filterKey: FilterKey;
  selectedFilterKey: FilterKey;
  setSelectedFilterKey: Dispatch<SetStateAction<FilterKey>>;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    index,
    filterKey,
    selectedFilterKey,
    setSelectedFilterKey,
    setIsOpened,
  } = props;
  const delay = (index + 8) * 0.025;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        bounce: 0.1,
        duration: 0.25,
        delay,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      onClick={() => {
        setSelectedFilterKey(filterKey);

        setTimeout(() => {
          setIsOpened(false);
        }, 150);
      }}
      className="flex cursor-default items-center justify-between rounded-2xl px-3 py-2 text-foreground hover:bg-accent"
    >
      <div className="flex items-center gap-x-3">
        <span className="text-muted-foreground">
          <filterKey.Icon size={24} />
        </span>
        <span>{filterKey.label}</span>
      </div>
      <div
        className={clsx(
          "relative h-6 w-6 overflow-hidden rounded-full border-border",
          selectedFilterKey.name == filterKey.name
            ? "border-none"
            : "border-[2px]"
        )}
      >
        {selectedFilterKey.name == filterKey.name && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Tick02Icon} size={16} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

const FilterInteraction = () => {
  const [selectedFilterKey, setSelectedFilterKey] = useState(filterKeys[0]);
  const [isOpened, setIsOpened] = useState(false);

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="فیلتر فهرست"
      className="flex items-center justify-center fill-muted-foreground/70 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <MotionConfig
        transition={{ type: "spring", duration: 0.85, bounce: 0.35 }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label="باز کردن فیلترها"
          aria-expanded={isOpened}
          onClick={() => setIsOpened(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpened(true);
            }
          }}
          className="relative start-2.5 flex h-20 w-20 items-center justify-center"
        >
          <HugeiconsIcon
            icon={FilterHorizontalIcon}
            className="relative z-10 fill-none text-foreground"
            size={36}
          />
          <motion.div
            layoutId="wrapper"
            className="absolute inset-0 z-[2] border-border bg-background"
            style={{ borderRadius: 40, borderWidth: 1 }}
          />
        </div>
        <motion.div
          initial={{ x: 0 }}
          animate={{
            x: isOpened ? 20 : 0,
          }}
          transition={{ type: "spring", bounce: 0.3, duration: 1.5 }}
          className="relative end-2.5 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-background"
        >
          <span className="text-muted-foreground">
            <selectedFilterKey.Icon size={36} />
          </span>
        </motion.div>

        {isOpened && (
          <motion.section
            layoutId="wrapper"
            className="absolute z-20 w-72 overflow-hidden border border-border bg-card px-1 py-1 text-xl"
            style={{ borderRadius: 20, borderWidth: 1 }}
          >
            <div className="flex flex-col gap-1">
              {filterKeys.map((item, index) => (
                <ListItem
                  key={item.name}
                  index={index}
                  filterKey={item}
                  selectedFilterKey={selectedFilterKey}
                  setSelectedFilterKey={setSelectedFilterKey}
                  setIsOpened={setIsOpened}
                />
              ))}
            </div>
          </motion.section>
        )}
      </MotionConfig>
    </section>
  );
};

export default FilterInteraction;
