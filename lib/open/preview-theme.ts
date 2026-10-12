export type PreviewTheme = "light" | "dark";

export const PREVIEW_THEME_KEY = "tarhak.preview-theme";

const CHANGE_EVENT = "tarhak:preview-theme";

export function readPreviewTheme(): PreviewTheme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(PREVIEW_THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  return "dark";
}

export function writePreviewTheme(theme: PreviewTheme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREVIEW_THEME_KEY, theme);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribePreviewTheme(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREVIEW_THEME_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}
