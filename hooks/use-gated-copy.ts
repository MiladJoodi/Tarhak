"use client";

import * as React from "react";

export type CopySource = "cli" | "code" | "manual_deps";

/**
 * Clipboard helper kept under the historical name so call sites stay stable.
 * Auth gating and copy_events telemetry were removed.
 */
export function useGatedCopy(_options?: {
  componentSlug?: string;
  source?: CopySource;
}) {
  return React.useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    return true;
  }, []);
}
