"use client";

import CommandPalette from "@/registry/default/example/command-palette";

export default function CommandPaletteDemo() {
  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-auto px-4 py-8">
      <CommandPalette />
    </div>
  );
}
