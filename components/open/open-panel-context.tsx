"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import type { OpenPanel } from "@/components/open/open-actions";

export type PreviewTheme = "light" | "dark";

const PREVIEW_THEME_KEY = "tarhak.preview-theme";

type OpenPanelContextValue = {
  panel: OpenPanel;
  setPanel: (panel: OpenPanel) => void;
  /** Localhost-only stage: hide open chrome for recording. */
  stage: boolean;
  setStage: (stage: boolean) => void;
  previewTheme: PreviewTheme;
  setPreviewTheme: (theme: PreviewTheme) => void;
};

const OpenPanelContext = React.createContext<OpenPanelContextValue | null>(null);

function readStoredTheme(): PreviewTheme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(PREVIEW_THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  return "dark";
}

export function OpenPanelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [panel, setPanelState] = React.useState<OpenPanel>(null);
  const [stage, setStageState] = React.useState(false);
  const [previewTheme, setPreviewThemeState] = React.useState<PreviewTheme>("dark");
  const [pathForPanel, setPathForPanel] = React.useState(pathname);

  // useLayoutEffect: apply stored theme before paint so light demos do not flash
  // a dark-tone hint (white connector line) under the mobile header.
  React.useLayoutEffect(() => {
    setPreviewThemeState(readStoredTheme());
  }, []);

  // Close drawers when the route changes (no scroll side effects).
  if (pathname !== pathForPanel) {
    setPathForPanel(pathname);
    if (panel !== null) setPanelState(null);
    if (stage) setStageState(false);
  }

  const setPanel = React.useCallback((next: OpenPanel) => {
    setPanelState(next);
  }, []);

  const setStage = React.useCallback((next: boolean) => {
    setStageState(next);
    if (next) setPanelState(null);
  }, []);

  const setPreviewTheme = React.useCallback((next: PreviewTheme) => {
    setPreviewThemeState(next);
    try {
      window.localStorage.setItem(PREVIEW_THEME_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = React.useMemo(
    () => ({ panel, setPanel, stage, setStage, previewTheme, setPreviewTheme }),
    [panel, setPanel, stage, setStage, previewTheme, setPreviewTheme],
  );

  return <OpenPanelContext.Provider value={value}>{children}</OpenPanelContext.Provider>;
}

export function useOpenPanel() {
  const value = React.useContext(OpenPanelContext);
  if (!value) {
    throw new Error("useOpenPanel must be used within OpenPanelProvider");
  }
  return value;
}
