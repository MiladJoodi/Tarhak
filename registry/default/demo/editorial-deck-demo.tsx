"use client";

import EditorialDeck from "@/registry/default/example/editorial-deck";

export default function EditorialDeckDemo() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col self-stretch overflow-hidden bg-transparent pt-[22vh] pb-20">
      <div className="flex min-h-0 flex-1 flex-col">
        <EditorialDeck title="" subtitle="" />
      </div>
    </div>
  );
}
