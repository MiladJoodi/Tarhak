"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

import {
  CurveDrawer as CurveDrawerRoot,
  CurveDrawerClose,
  CurveDrawerContent,
  CurveDrawerDescription,
  CurveDrawerHeader,
  CurveDrawerTitle,
  CurveDrawerTrigger,
} from "./curve-drawer-primitives";

const NAV_ITEMS = ["نمای کلی", "پروژه‌ها", "بایگانی", "تنظیمات"];

export default function CurveDrawer() {
  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="دمو کشوی منحنی"
      className="flex h-full min-h-[520px] w-full items-center justify-center bg-background p-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal text-foreground"
    >
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <CurveDrawerRoot direction="right" handleOnly>
          <CurveDrawerTrigger asChild>
            <button
              aria-label="باز کردن کشوی منو"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "cursor-pointer"
              )}
              type="button"
            >
              باز کردن راست
            </button>
          </CurveDrawerTrigger>
          <CurveDrawerContent curveSide="right">
            <CurveDrawerHeader className="flex-row items-start justify-between gap-4 border-b border-border">
              <div className="min-w-0">
                <CurveDrawerTitle>منو</CurveDrawerTitle>
                <CurveDrawerDescription>
                  لبهٔ داخلی اول برآمدگی است، بعد صاف می‌نشیند.
                </CurveDrawerDescription>
              </div>
              <CurveDrawerClose asChild>
                <button
                  aria-label="بستن کشوی منو"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "shrink-0"
                  )}
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </CurveDrawerClose>
            </CurveDrawerHeader>
            <nav aria-label="منوی دمو" className="flex flex-col gap-1 p-4">
              {NAV_ITEMS.map((item) => (
                <span
                  className="rounded-lg px-3 py-2 text-sm text-foreground"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </nav>
          </CurveDrawerContent>
        </CurveDrawerRoot>

        <CurveDrawerRoot direction="left" handleOnly>
          <CurveDrawerTrigger asChild>
            <button
              aria-label="باز کردن کشوی یادداشت"
              className={cn(buttonVariants(), "cursor-pointer")}
              type="button"
            >
              باز کردن چپ
            </button>
          </CurveDrawerTrigger>
          <CurveDrawerContent curveSide="left">
            <CurveDrawerHeader className="flex-row items-start justify-between gap-4 border-b border-border">
              <div className="min-w-0">
                <CurveDrawerTitle>یادداشت‌ها</CurveDrawerTitle>
                <CurveDrawerDescription>
                  همان منحنی، آینه‌شده روی لبهٔ داخلی راست.
                </CurveDrawerDescription>
              </div>
              <CurveDrawerClose asChild>
                <button
                  aria-label="بستن کشوی یادداشت"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "shrink-0"
                  )}
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </CurveDrawerClose>
            </CurveDrawerHeader>
            <div className="space-y-3 p-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                پنل در ۸۰۰ میلی‌ثانیه می‌لغزد. بازوی SVG از برآمدگی درجه‌دوم به
                لبهٔ صاف مورف می‌شود.
              </p>
              <p>
                درگ لمسی فقط از دسته است تا اسکرول شیت آن را نبندد.
              </p>
            </div>
          </CurveDrawerContent>
        </CurveDrawerRoot>
      </div>
    </section>
  );
}
