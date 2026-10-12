"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import ScrollStackDeck from "@/registry/default/example/scroll-stack-deck";

export default function ScrollStackDeckDemo() {
  // Stable RefObject — inline `{ current: el }` breaks useScroll subscriptions.
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  const setScroller = useCallback((node: HTMLDivElement | null) => {
    scrollerRef.current = node;
    setReady(Boolean(node));
  }, []);

  useEffect(() => {
    if (!ready || !scrollerRef.current) return;
    scrollerRef.current.scrollTop = 0;
  }, [ready]);

  return (
    // `absolute inset-0` (not h-full): parent must clip height or the scroller
    // grows with the 5×110vh track, sticky/useScroll break, and the deck dumps
    // every card on load.
    <div
      ref={setScroller}
      className="absolute inset-0 overflow-y-auto overscroll-contain bg-[#EEF1F4] dark:bg-[hsl(225_7%_11%)]"
    >
      {ready ? (
        <ScrollStackDeck
          title=""
          subtitle=""
          scrollIndicatorText=""
          showFooter={false}
          enableLenis={false}
          container={scrollerRef}
        />
      ) : null}
    </div>
  );
}
