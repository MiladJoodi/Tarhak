"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ViewMode } from "@/components/browse/browse-toolbar";

export type BrowseUrlState = {
  query: string;
  category: string;
  view: ViewMode;
  collection: string;
  focus: string;
  setQuery: (value: string) => void;
  setCategory: (value: string) => void;
  setView: (value: ViewMode) => void;
  setCollection: (value: string) => void;
  setFocus: (value: string) => void;
  clearFilters: () => void;
};

function parseView(raw: string | null): ViewMode {
  return raw === "grid" ? "grid" : "canvas";
}

/**
 * Shareable browse filters via URL:
 * ?q= &cat= &view= &collection= &focus=
 *
 * Search text is local + debounced into the URL so typing stays snappy.
 */
export function useBrowseUrlState(): BrowseUrlState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("cat") ?? "";
  const category =
    !categoryParam || categoryParam === "All" ? "" : categoryParam;
  const view = parseView(searchParams.get("view"));
  const collection = searchParams.get("collection") ?? "";
  const focus = searchParams.get("focus") ?? "";

  const [query, setQueryLocal] = React.useState(urlQuery);
  const queryTimer = React.useRef<number>(0);
  const queryRef = React.useRef(query);
  queryRef.current = query;
  const searchParamsRef = React.useRef(searchParams);
  searchParamsRef.current = searchParams;

  React.useEffect(() => {
    setQueryLocal(urlQuery);
  }, [urlQuery]);

  const replaceParams = React.useCallback(
    (patch: Partial<{
      q: string;
      cat: string;
      view: ViewMode;
      collection: string;
      focus: string;
    }>) => {
      const next = new URLSearchParams(searchParamsRef.current.toString());
      const setOrDelete = (key: string, value: string | undefined) => {
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
      };

      // Keep in-flight typed search when other filters change before debounce flushes.
      if ("q" in patch) setOrDelete("q", patch.q?.trim() || "");
      else setOrDelete("q", queryRef.current.trim() || "");

      if ("cat" in patch) {
        const cat = patch.cat?.trim() || "";
        setOrDelete("cat", cat === "All" ? "" : cat);
      }
      if ("view" in patch) {
        setOrDelete("view", patch.view === "grid" ? "grid" : "");
      }
      if ("collection" in patch) {
        setOrDelete("collection", patch.collection?.trim() || "");
      }
      if ("focus" in patch) setOrDelete("focus", patch.focus?.trim() || "");

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  React.useEffect(() => {
    return () => window.clearTimeout(queryTimer.current);
  }, []);

  const setQuery = React.useCallback(
    (value: string) => {
      setQueryLocal(value);
      window.clearTimeout(queryTimer.current);
      queryTimer.current = window.setTimeout(() => {
        replaceParams({ q: value });
      }, 180);
    },
    [replaceParams],
  );

  const setCategory = React.useCallback(
    (value: string) => {
      replaceParams({ cat: value });
    },
    [replaceParams],
  );

  const setView = React.useCallback(
    (value: ViewMode) => {
      replaceParams({ view: value });
    },
    [replaceParams],
  );

  const setCollection = React.useCallback(
    (value: string) => {
      replaceParams({ collection: value });
    },
    [replaceParams],
  );

  const setFocus = React.useCallback(
    (value: string) => {
      replaceParams({ focus: value });
    },
    [replaceParams],
  );

  const clearFilters = React.useCallback(() => {
    window.clearTimeout(queryTimer.current);
    setQueryLocal("");
    replaceParams({ q: "", cat: "", collection: "" });
  }, [replaceParams]);

  return {
    query,
    category,
    view,
    collection,
    focus,
    setQuery,
    setCategory,
    setView,
    setCollection,
    setFocus,
    clearFilters,
  };
}
