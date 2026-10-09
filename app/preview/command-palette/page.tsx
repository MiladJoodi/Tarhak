import type { Metadata } from "next";

import CommandPalette from "@/registry/default/example/command-palette";

export const metadata: Metadata = {
  title: "Command Palette",
  robots: { index: false, follow: false },
};

export default function CommandPalettePreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <CommandPalette />
    </main>
  );
}
