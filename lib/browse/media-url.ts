/** Local browse media served from `browse-media/` via the API route. */
export function localPosterUrl(slug: string): string {
  return `/api/browse-media/components/${slug}/poster.avif`;
}

/**
 * Extension-less video URL — the API serves `.webm` when present, else `.mp4`.
 * Safe for client bundles (no Node `fs`).
 */
export function localVideoUrl(slug: string): string {
  return `/api/browse-media/components/${slug}/video`;
}

/** @deprecated Prefer localPosterUrl / localVideoUrl. Kept for call sites that still pass a path. */
export function browseMediaUrl(url: string): string {
  if (url.startsWith("/api/browse-media/")) return url;
  return url;
}
