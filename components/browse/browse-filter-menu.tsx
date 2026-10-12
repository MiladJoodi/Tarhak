"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { categoryLabelFa } from "@/lib/browse/categories-fa";
import { BROWSE_COLLECTIONS } from "@/lib/browse/collections";
import { browseCategories } from "@/lib/browse/items";
import { cn } from "@/lib/utils";

export function BrowseFilterMenu({
  category,
  onCategoryChange,
  collection,
  onCollectionChange,
}: {
  category: string;
  onCategoryChange: (value: string) => void;
  collection: string;
  onCollectionChange: (value: string) => void;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const categories = browseCategories.filter((c) => c !== "All");

  const activeCollection = BROWSE_COLLECTIONS.find((c) => c.id === collection);
  const label = activeCollection
    ? activeCollection.titleFa
    : category
      ? categoryLabelFa(category)
      : "همه";

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pickCollection = (id: string) => {
    onCollectionChange(id);
    onCategoryChange("");
    setOpen(false);
  };

  const pickCategory = (id: string) => {
    onCategoryChange(id);
    onCollectionChange("");
    setOpen(false);
  };

  const pickAll = () => {
    onCollectionChange("");
    onCategoryChange("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="فیلتر کامپوننت‌ها"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-10 max-w-[9.5rem] cursor-pointer items-center gap-1 rounded-full px-3 sm:max-w-[11rem]",
          "bg-white/[0.07] text-[13px] font-medium text-white/85 ring-1 ring-white/14",
          "transition-[background-color,ring-color] duration-150",
          "hover:bg-white/10 hover:ring-white/22",
          open && "bg-white/12 ring-white/35",
        )}
      >
        <span className="min-w-0 truncate">{label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-white/45 transition-transform duration-150",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="فیلترها"
          className={cn(
            "absolute top-[calc(100%+8px)] z-40 w-[min(100vw-2rem,16rem)] overflow-hidden rounded-2xl",
            "border border-white/10 bg-[#141418]/95 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md",
            "end-0 sm:end-auto sm:start-0",
          )}
        >
          <div className="max-h-[min(70vh,22rem)] overflow-y-auto p-1.5">
            <MenuItem
              selected={!collection && !category}
              onClick={pickAll}
              label="همه"
            />

            <p className="px-2.5 pt-2.5 pb-1 text-[11px] font-medium text-white/35">
              کالکشن
            </p>
            {BROWSE_COLLECTIONS.map((item) => (
              <MenuItem
                key={item.id}
                selected={collection === item.id}
                onClick={() => pickCollection(item.id)}
                label={item.titleFa}
              />
            ))}

            <p className="px-2.5 pt-2.5 pb-1 text-[11px] font-medium text-white/35">
              دسته
            </p>
            {categories.map((item) => (
              <MenuItem
                key={item}
                selected={!collection && category === item}
                onClick={() => pickCategory(item)}
                label={categoryLabelFa(item)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center rounded-xl px-3 py-2 text-start text-[13px] transition-colors",
        selected
          ? "bg-white/12 text-white"
          : "text-white/75 hover:bg-white/8 hover:text-white",
      )}
    >
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}
