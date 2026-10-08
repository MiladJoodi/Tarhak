"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Message01Icon,
  Folder02Icon,
  Add01Icon,
  CircleArrowUpRight02Icon,
  Search01Icon,
  BarChartIcon,
  Tick01Icon,
  Settings02Icon,
  InformationCircleIcon,
  DatabaseIcon,
  Mail01Icon,
  LeftToRightListDashIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface TabConfig {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  header: string;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: "dashboard",
    label: "داشبورد",
    icon: DashboardSquare01Icon,
    header: "نمای کلی پروژه",
    description: "خلاصهٔ روزانهٔ عملکرد تیم شما.",
  },
  {
    id: "management",
    label: "مدیریت",
    icon: UserGroupIcon,
    header: "مدیریت تیم",
    description: "نقش‌ها و دسترسی کاربران را مدیریت کنید.",
    badge: "10",
  },
  {
    id: "threads",
    label: "گفتگوها",
    icon: Message01Icon,
    header: "ارتباطات",
    description: "بحث‌های اولویت‌دار تیم.",
    badge: "12",
  },
  {
    id: "resources",
    label: "منابع",
    icon: Folder02Icon,
    header: "دارایی‌های سیستم",
    description: "مستندات مشترک و لاگ‌های رسانه.",
  },
];

const BentoCard = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const content = useMemo(() => {
    switch (activeTab.id) {
      case "dashboard":
        return <OverviewDashboard />;
      case "management":
        return <ManagementDashboard />;
      case "threads":
        return <ThreadsDashboard />;
      case "resources":
        return <ResourcesDashboard />;
      default:
        return null;
    }
  }, [activeTab.id]);

  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex w-full items-center justify-center font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal antialiased"
    >
      <div className="group relative m-0 w-full max-w-xl overflow-hidden rounded-3xl border bg-card shadow-2xl shadow-primary/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-primary/10 sm:rounded-4xl">
        <div className="relative z-10 space-y-1.5 p-4 sm:p-6">
          <h2 className="text-xs text-muted-foreground">
            داشبورد پروژه
          </h2>
          <p className="max-w-[480px] text-lg font-medium leading-snug text-foreground sm:text-2xl">
            ابزارهای تحلیل پرتوان و همکاری تیمی، همه در یک جا.
          </p>
        </div>

        <div className="relative h-[260px] w-full overflow-hidden rounded-2xl sm:h-[300px] sm:rounded-[2rem]">
          <div className="absolute top-16 start-16 h-full w-full rounded-3xl border border-border/50 bg-muted opacity-80" />

          <div className="absolute top-8 start-24 flex h-full w-full flex-col overflow-hidden rounded-ss-3xl bg-background shadow-xl ring-6 ring-border">
            <div className="relative flex items-center rounded-ss-3xl border-b border-border/70 px-5 py-4 backdrop-blur-sm">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
              </div>
              <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
                <span className="text-xs text-muted-foreground/50">
                  فضای کار
                </span>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex w-36 flex-col gap-1 border-e border-border/30 bg-muted/5 p-2 pt-6">
                <LayoutGroup>
                  {TABS.map((tab) => {
                    const isActive = activeTab.id === tab.id;
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "relative flex cursor-pointer items-center gap-1.5 rounded-xl p-2 text-xs transition-colors",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <HugeiconsIcon
                          icon={Icon}
                          size={14}
                          className="relative z-20 shrink-0"
                        />
                        <span className="relative z-20 truncate font-medium">
                          {tab.label}
                        </span>
                        {tab.badge && (
                          <span
                            className={cn(
                              "relative z-20 ms-auto rounded-md px-1 py-0.5 text-[8px] leading-none tabular-nums transition-all",
                              isActive
                                ? "border border-primary/20 bg-primary/10 text-primary"
                                : "border border-transparent bg-muted text-muted-foreground",
                            )}
                          >
                            {tab.badge}
                          </span>
                        )}

                        {isActive && (
                          <motion.div
                            layoutId="sidebar-pill"
                            className="absolute start-0 z-30 h-4 w-[2px] rounded-full border border-primary/20 bg-primary"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="backgroundIndicator"
                            className="absolute inset-0 rounded-lg border border-border/40 bg-muted"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </LayoutGroup>
              </div>

              <div className="flex-1 bg-background p-5 pt-6 flex flex-col gap-4 overflow-hidden relative">
                <header className="flex flex-col gap-0.5">
                  <h3 className="line-clamp-1 text-xs font-semibold text-foreground opacity-60">
                    {activeTab.header}
                  </h3>
                  <p className="line-clamp-1 text-[10px] font-normal leading-tight text-muted-foreground">
                    {activeTab.description}
                  </p>
                </header>

                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={activeTab.id}
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="flex-1"
                  >
                    {content}
                  </motion.div>
                </AnimatePresence>

                <div className="pointer-none absolute inset-x-0 bottom-0 z-20 h-10 bg-linear-to-t from-background to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoCard;

const OverviewDashboard = () => (
  <div className="flex flex-col gap-3 h-full">
    <div className="relative p-3.5 rounded-xl border border-border/40 bg-linear-to-br from-background to-muted/20 overflow-hidden">
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-medium text-muted-foreground">
            عملکرد تیم
          </span>
          <HugeiconsIcon
            icon={CircleArrowUpRight02Icon}
            size={12}
            className="text-primary"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-medium text-foreground">
            ۹۴٫۲٪
          </span>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "94.2%" }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>
        <span className="text-[9px] text-muted-foreground">
          امتیاز کمپین‌های جستجو و تحویل
        </span>
      </div>
      <div className="absolute -end-2 -bottom-2 scale-150 rotate-12 opacity-5">
        <HugeiconsIcon icon={BarChartIcon} size={64} />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/50 p-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-foreground">۱٬۰۷۰</span>
          <span className="text-[8px] font-medium text-muted-foreground">
            کلیدواژه
          </span>
        </div>
        <HugeiconsIcon icon={Search01Icon} size={14} className="opacity-20" />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/50 p-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-foreground">۲٫۳م</span>
          <span className="text-[8px] font-medium text-muted-foreground">
            اعتبار
          </span>
        </div>
        <HugeiconsIcon
          icon={InformationCircleIcon}
          size={14}
          className="opacity-20"
        />
      </div>
    </div>
  </div>
);

const ManagementDashboard = () => (
  <div className="flex flex-col h-full not-prose">
    <div className="rounded-xl border border-border/40 overflow-hidden flex flex-col h-full bg-background/50">
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-3 py-2">
        <span className="text-[9px] font-semibold text-muted-foreground">
          کاربران فعال
        </span>
        <div className="flex items-center gap-1.5 rounded-md border border-border/40 bg-background px-1.5 py-0.5">
          <HugeiconsIcon
            icon={Search01Icon}
            size={10}
            className="text-muted-foreground/50"
          />
          <span className="text-[8px] font-medium text-muted-foreground">
            جستجو
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 p-1">
        {[
          {
            name: "آنتونی دیون",
            role: "در انتظار تأیید ادمین",
            status: "لیست انتظار",
            color: "bg-amber-400",
          },
          {
            name: "نیک یاهودین",
            role: "ادمین گروه نمایندگی",
            status: "فعال",
            color: "bg-emerald-400",
          },
          {
            name: "مجیب آیماق",
            role: "کاربر گروه نمایندگی",
            status: "فعال",
            color: "bg-emerald-400",
          },
        ].map((user, i) => (
          <div
            key={i}
            className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/30"
          >
            <div className="relative flex h-6 w-6 items-center justify-center rounded-full border border-border/40 bg-muted">
              <HugeiconsIcon
                icon={UserIcon}
                size={10}
                className="text-muted-foreground"
              />
              <div
                className={cn(
                  "absolute -bottom-0.5 -end-0.5 h-2 w-2 rounded-full border border-background",
                  user.color,
                )}
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-medium text-foreground truncate">
                {user.name}
              </span>
              <span className="text-[8px] text-muted-foreground truncate">
                {user.role}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <HugeiconsIcon
                icon={Settings02Icon}
                size={12}
                className="text-muted-foreground"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ThreadsDashboard = () => (
  <div className="flex flex-col gap-3 h-full">
    <div className="grid grid-cols-2 gap-3">
      {[
        {
          title: "ساخت صفحه",
          desc: "پایهٔ پروژه را بسازید.",
          icon: Folder02Icon,
        },
        {
          title: "ساخت کار",
          desc: "با تیم سازماندهی کنید.",
          icon: Tick01Icon,
        },
      ].map((card, i) => (
        <div
          key={i}
          className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border/40 bg-background/50 p-3.5"
        >
          <div className="z-10 flex flex-col gap-1">
            <span className="text-[12px] font-medium leading-tight text-foreground">
              {card.title}
            </span>
            <span className="text-[9px] leading-tight text-muted-foreground">
              {card.desc}
            </span>
          </div>
          <button className="z-10 flex w-fit items-center gap-1.5 rounded-md bg-foreground px-2 py-1 text-[8px] font-semibold text-background transition-transform active:scale-95 group-hover:bg-primary">
            <HugeiconsIcon icon={Add01Icon} size={8} strokeWidth={3} />
            ایجاد
          </button>
        </div>
      ))}
    </div>

    <div className="mt-auto flex items-center justify-between rounded-xl border border-border/30 bg-muted/20 p-3">
      <div className="flex items-center gap-2">
        <div className="rounded-md border border-border/40 bg-background p-1 px-1.5">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={10}
            className="text-muted-foreground"
          />
        </div>
        <span className="text-[9px] font-medium text-muted-foreground">
          سنجاق کردن مورد جدید
        </span>
      </div>
      <HugeiconsIcon
        icon={Add01Icon}
        size={12}
        className="text-muted-foreground/50"
      />
    </div>
  </div>
);

const ResourcesDashboard = () => (
  <div className="flex flex-col gap-3 h-full overflow-hidden">
    <div className="flex-1 rounded-xl border border-border/40 flex flex-col bg-background/50 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-3 py-2">
        <span className="text-[9px] font-semibold text-muted-foreground">
          آرشیو و لاگ‌ها
        </span>
        <HugeiconsIcon
          icon={DatabaseIcon}
          size={12}
          className="text-muted-foreground/30"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-1 scrollbar-hide">
        {[
          {
            file: "design_spec_v2.pdf",
            size: "۲٫۴ مگابایت",
            type: "PDF",
            icon: Mail01Icon,
          },
          {
            file: "q4_performance.xls",
            size: "۱٫۱ مگابایت",
            type: "XLS",
            icon: BarChartIcon,
          },
          {
            file: "branding_assets.zip",
            size: "۴۸ مگابایت",
            type: "ZIP",
            icon: Folder02Icon,
          },
          {
            file: "system_logs.json",
            size: "۴ کیلوبایت",
            type: "JSON",
            icon: Folder02Icon,
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-md bg-muted/50 border border-border/40 flex items-center justify-center text-muted-foreground/60 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
              <HugeiconsIcon icon={item.icon} size={12} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-medium text-foreground truncate">
                {item.file}
              </span>
              <span className="text-[8px] text-muted-foreground tabular-nums uppercase">
                {item.size} • {item.type}
              </span>
            </div>
            <HugeiconsIcon
              icon={CircleArrowUpRight02Icon}
              size={10}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);
