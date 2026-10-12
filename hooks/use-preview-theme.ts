"use client";

import * as React from "react";

import {
  readPreviewTheme,
  subscribePreviewTheme,
  writePreviewTheme,
  type PreviewTheme,
} from "@/lib/open/preview-theme";

export function usePreviewTheme() {
  const theme = React.useSyncExternalStore(
    subscribePreviewTheme,
    readPreviewTheme,
    (): PreviewTheme => "dark",
  );

  const setTheme = React.useCallback((next: PreviewTheme) => {
    writePreviewTheme(next);
  }, []);

  return [theme, setTheme] as const;
}
