"use client";

import CardFolder from "@/registry/default/example/card-folder";

export default function CardFolderDemo() {
  return (
    <div className="h-full min-h-0 w-full min-w-0 overflow-auto bg-[#FAF8F5]">
      <div className="flex min-h-full w-full items-center justify-center px-3 pt-24 pb-28 md:px-6 md:py-28">
        <CardFolder />
      </div>
    </div>
  );
}
