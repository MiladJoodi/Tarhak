"use client";
// Adapted from beui.dev/components/blocks/infinite-masonry

import { useVirtualizer } from "@tanstack/react-virtual";
import { AlertCircle, Inbox } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/** Motion tokens — inlined so the registry file stays self-contained. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SPRING_PANEL = {
  type: "spring" as const,
  stiffness: 420,
  damping: 40,
  mass: 0.5,
};

function faNum(n: number) {
  return n.toLocaleString("fa-IR");
}

export type InfiniteMasonryKey = string | number | bigint;

export interface InfiniteMasonryProps<T> {
  items: readonly T[];
  getItemKey: (item: T, index: number) => InfiniteMasonryKey;
  renderItem: (item: T, index: number) => ReactNode;
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
  estimateSize?: (item: T, index: number) => number;
  renderLoadingItem?: (index: number) => ReactNode;
  emptyState?: ReactNode;
  endState?: ReactNode;
  minColumnWidth?: number;
  maxColumns?: number;
  gap?: number;
  overscan?: number;
  prefetch?: number;
  animateItems?: boolean;
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
}

type MasonryMetrics = {
  columns: number;
  width: number;
};

function useMasonryMetrics({
  elementRef,
  gap,
  maxColumns,
  minColumnWidth,
}: {
  elementRef: React.RefObject<HTMLDivElement | null>;
  gap: number;
  maxColumns: number;
  minColumnWidth: number;
}) {
  const [metrics, setMetrics] = useState<MasonryMetrics>({
    columns: 1,
    width: 0,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const update = (width: number) => {
      const columns = Math.min(
        maxColumns,
        Math.max(1, Math.floor((width + gap) / (minColumnWidth + gap))),
      );

      setMetrics((current) =>
        current.columns === columns && current.width === width
          ? current
          : { columns, width },
      );
    };

    update(element.getBoundingClientRect().width);

    const observer = new ResizeObserver(([entry]) => {
      update(entry.contentRect.width);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, gap, maxColumns, minColumnWidth]);

  return metrics;
}

function DefaultLoadingItem({ index }: { index: number }) {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-2xl border border-border bg-card p-3"
      style={{ minHeight: 144 + (index % 3) * 36 }}
    >
      <div className="h-3 w-2/3 rounded-full bg-muted" />
      <div className="mt-3 h-2 w-full rounded-full bg-muted" />
      <div className="mt-2 h-2 w-4/5 rounded-full bg-muted" />
    </div>
  );
}

function DefaultEmptyState() {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center px-6 text-center">
      <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-foreground">هنوز موردی نیست</p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
        وقتی چیزی اضافه شود، اینجا دیده می‌شود.
      </p>
    </div>
  );
}

function MasonryItemReveal({
  itemKey,
  lane,
  revealedKeys,
  animate,
  children,
}: {
  itemKey: InfiniteMasonryKey;
  lane: number;
  revealedKeys: MutableRefObject<Set<InfiniteMasonryKey>>;
  animate: boolean;
  children: ReactNode;
}) {
  const [shouldReveal] = useState(
    () => animate && !revealedKeys.current.has(itemKey),
  );

  useEffect(() => {
    revealedKeys.current.add(itemKey);
  }, [itemKey, revealedKeys]);

  const delay = Math.min(lane, 3) * 0.04;

  return (
    <motion.div
      initial={shouldReveal ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        y: { ...SPRING_PANEL, delay },
        opacity: { duration: 0.2, ease: EASE_OUT, delay },
      }}
    >
      {children}
    </motion.div>
  );
}

export function InfiniteMasonry<T>({
  items,
  getItemKey,
  renderItem,
  onLoadMore,
  hasMore,
  loading = false,
  error,
  onRetry,
  estimateSize = () => 240,
  renderLoadingItem = (index) => <DefaultLoadingItem index={index} />,
  emptyState = <DefaultEmptyState />,
  endState,
  minColumnWidth = 208,
  maxColumns = 4,
  gap = 12,
  overscan = 4,
  prefetch = 3,
  animateItems = true,
  ariaLabel = "فهرست میسونری بی‌نهایت",
  className,
  contentClassName,
  itemClassName,
}: InfiniteMasonryProps<T>) {
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);
  const loadPendingRef = useRef(false);
  const initialItemCountRef = useRef(items.length);
  const revealedKeysRef = useRef(new Set<InfiniteMasonryKey>());
  const { columns, width } = useMasonryMetrics({
    elementRef: contentRef,
    gap,
    maxColumns,
    minColumnWidth,
  });

  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!loading) loadPendingRef.current = false;
  }, [loading]);

  const hasError = error !== undefined && error !== null;
  const tailCount = hasError ? 1 : loading ? columns : 0;
  const virtualizer = useVirtualizer({
    count: items.length + tailCount,
    getScrollElement: () => scrollRef.current,
    getItemKey: (index) =>
      index < items.length
        ? getItemKey(items[index], index)
        : `masonry-tail-${index - items.length}`,
    estimateSize: (index) =>
      index < items.length
        ? estimateSize(items[index], index)
        : 144 + ((index - items.length) % 3) * 36,
    gap,
    lanes: columns,
    overscan: overscan * columns,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const viewportEnd =
    (virtualizer.scrollOffset ?? 0) + (virtualizer.scrollRect?.height ?? 0);
  const lastVisibleIndex = virtualItems.reduce(
    (lastIndex, item) =>
      item.start < viewportEnd ? Math.max(lastIndex, item.index) : lastIndex,
    -1,
  );

  useEffect(() => {
    if (
      hasError ||
      loading ||
      !hasMore ||
      loadPendingRef.current ||
      lastVisibleIndex < Math.max(0, items.length - prefetch)
    ) {
      return;
    }

    loadPendingRef.current = true;
    void Promise.resolve(loadMoreRef.current()).finally(() => {
      loadPendingRef.current = false;
    });
  }, [hasError, hasMore, items.length, lastVisibleIndex, loading, prefetch]);

  if (items.length === 0 && !hasMore && !loading && !hasError) {
    return (
      <section
        aria-label={ariaLabel}
        className={cn(
          "w-full overflow-hidden rounded-3xl border border-border bg-background",
          className,
        )}
      >
        {emptyState}
      </section>
    );
  }

  const columnWidth =
    columns > 0 ? Math.max(0, (width - gap * (columns - 1)) / columns) : 0;

  return (
    <section
      ref={scrollRef}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={cn(
        "w-full contain-[layout_paint] overflow-y-auto overscroll-none rounded-3xl border border-border bg-background p-3 [overflow-anchor:none] [scrollbar-gutter:stable]",
        className,
      )}
    >
      <div
        ref={contentRef}
        className={cn("relative w-full", contentClassName)}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualItems.map((virtualItem) => {
          const isTail = virtualItem.index >= items.length;
          const tailIndex = virtualItem.index - items.length;

          return (
            <div
              key={virtualItem.key}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              className={cn(
                "absolute top-0 will-change-transform",
                !isTail && itemClassName,
              )}
              style={{
                width: columnWidth,
                insetInlineStart: virtualItem.lane * (columnWidth + gap),
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isTail ? (
                hasError ? (
                  <div className="flex min-h-36 flex-col items-start justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="size-4" aria-hidden="true" />
                      <p className="text-sm font-medium">بارگذاری بیشتر نشد</p>
                    </div>
                    <div className="mt-2 text-xs leading-5 text-muted-foreground">
                      {error}
                    </div>
                    {onRetry ? (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="mt-3 min-h-10 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        دوباره تلاش کن
                      </button>
                    ) : null}
                  </div>
                ) : (
                  renderLoadingItem(tailIndex)
                )
              ) : (
                <MasonryItemReveal
                  itemKey={virtualItem.key}
                  lane={virtualItem.lane}
                  revealedKeys={revealedKeysRef}
                  animate={
                    animateItems &&
                    !reduceMotion &&
                    virtualItem.index >= initialItemCountRef.current
                  }
                >
                  {renderItem(items[virtualItem.index], virtualItem.index)}
                </MasonryItemReveal>
              )}
            </div>
          );
        })}
      </div>

      {!hasMore && items.length > 0 && endState ? (
        <div className="py-4 text-center text-xs text-muted-foreground">
          {endState}
        </div>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {loading ? "در حال بارگذاری موارد بیشتر" : null}
      </span>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Demo                                                                       */
/* -------------------------------------------------------------------------- */

type GalleryItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  imageHeight: number;
};

const PAGE_SIZE = 6;
const MAX_ITEMS = 42;

const gallerySource = [
  {
    title: "هندسهٔ نرم",
    category: "معماری",
    image: "/unsplash/1486406146926-c627a92ad1ab.webp",
    imageHeight: 260,
  },
  {
    title: "افق باز",
    category: "منظره",
    image: "/unsplash/1500530855697-b586d89ba3ee.webp",
    imageHeight: 190,
  },
  {
    title: "ریتم کار",
    category: "فضای کار",
    image: "/unsplash/1497366216548-37526070297c.webp",
    imageHeight: 230,
  },
  {
    title: "میز مشترک",
    category: "استودیو",
    image: "/unsplash/1488590528505-98d2b5aba04b.webp",
    imageHeight: 300,
  },
  {
    title: "در جلسه",
    category: "مردم",
    image: "/unsplash/1522075469751-3a6694fb2f61.webp",
    imageHeight: 210,
  },
  {
    title: "بعد از ساعت",
    category: "دفتر",
    image: "/unsplash/1498050108023-c5249f4df085.webp",
    imageHeight: 280,
  },
] as const;

function createItems(start: number, count: number): GalleryItem[] {
  return Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    const source = gallerySource[index % gallerySource.length];

    return {
      ...source,
      id: `gallery-${index}`,
      title: `${source.title} ${faNum(Math.floor(index / gallerySource.length) + 1)}`,
    };
  });
}

/** پیش‌نمایش فارسی — میسونری مجازی با بارگذاری هنگام اسکرول. */
export default function InfiniteMasonryExample() {
  const [items, setItems] = useState(() => createItems(0, 12));
  const [loading, setLoading] = useState(false);
  const hasMore = items.length < MAX_ITEMS;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 650));
    setItems((current) => {
      const count = Math.min(PAGE_SIZE, MAX_ITEMS - current.length);
      return count > 0
        ? [...current, ...createItems(current.length, count)]
        : current;
    });
    setLoading(false);
  }, [hasMore, loading]);

  return (
    <section
      dir="rtl"
      lang="fa"
      className="relative flex h-full w-full items-center justify-center bg-transparent px-4 py-8 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div className="w-full max-w-5xl">
        <div className="mb-3 flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-sm font-semibold text-foreground">فهرست بصری</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              اسکرول کنید تا صفحهٔ بعد بارگذاری شود
            </p>
          </div>
          <p className="font-mono text-xs tabular-nums text-muted-foreground" dir="ltr">
            {faNum(items.length)} مورد
          </p>
        </div>

        <InfiniteMasonry
          items={items}
          getItemKey={(item) => item.id}
          renderItem={(item) => (
            <figure className="overflow-hidden rounded-2xl border border-border bg-card">
              <div
                className="relative w-full overflow-hidden bg-muted"
                style={{ height: item.imageHeight }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
              <figcaption className="flex items-start justify-between gap-3 p-3">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="shrink-0 text-[10px] text-muted-foreground">
                  {item.category}
                </p>
              </figcaption>
            </figure>
          )}
          onLoadMore={loadMore}
          hasMore={hasMore}
          loading={loading}
          estimateSize={(item) => item.imageHeight + 66}
          endState="همه موارد بارگذاری شد"
          ariaLabel="گالری الهام بصری"
          className="h-[34rem]"
        />
      </div>
    </section>
  );
}
