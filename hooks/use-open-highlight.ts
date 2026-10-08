"use client";

import * as React from "react";

import {
  emptyHighlightPayload,
  type OpenHighlightPayload,
} from "@/lib/open/highlight-types";

const cache = new Map<string, OpenHighlightPayload>();

export function useOpenHighlight(slug: string, enabled: boolean) {
  const [data, setData] = React.useState<OpenHighlightPayload | null>(
    () => cache.get(slug) ?? null,
  );
  const [loading, setLoading] = React.useState(() => enabled && !cache.has(slug));
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled) return;
    const cached = cache.get(slug);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/open/components/${encodeURIComponent(slug)}/highlight`)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error || `Highlight failed (${res.status})`);
        }
        return res.json() as Promise<OpenHighlightPayload>;
      })
      .then((payload) => {
        if (cancelled) return;
        cache.set(slug, payload);
        setData(payload);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Highlight failed");
        setData(emptyHighlightPayload());
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, enabled]);

  return {
    highlight: data ?? emptyHighlightPayload(),
    loading: enabled && loading,
    error,
  };
}
