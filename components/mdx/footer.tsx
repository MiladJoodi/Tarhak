"use client";

import { useMemo } from "react";

import { useTreeContext } from "fumadocs-ui/contexts/tree";
import { Link, usePathname } from "fumadocs-core/framework";
import type * as PageTree from "fumadocs-core/page-tree";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Footer() {
  const { root } = useTreeContext();
  const pathname = usePathname();
  const flatten = useMemo(() => {
    const result: PageTree.Item[] = [];

    function scan(items: PageTree.Node[]) {
      for (const item of items) {
        if (item.type === "page" && !item.url.startsWith("/docs/components/")) {
          result.push(item);
        }
        else if (item.type === "folder") {
          if (item.index) result.push(item.index);
          scan(item.children);
        }
      }
    }

    scan(root.children);
    return result;
  }, [root]);

  const { previous, next } = useMemo(() => {
    const idx = flatten.findIndex((item) => item.url === pathname);

    if (idx === -1) return {};
    return {
      previous: flatten[idx - 1],
      next: flatten[idx + 1],
    };
  }, [flatten, pathname]);

  return (
    <div className="mt-12 flex flex-row justify-between border-t border-white/12 pt-12">
      {previous ? (
        <Link
          href={previous.url}
          className="group flex flex-row items-center gap-1.5 font-medium text-white/55 transition-colors duration-150 hover:text-white"
        >
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
          />
          <span>{previous.name}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.url}
          className="group flex flex-row items-center gap-1.5 text-end font-medium text-white/55 transition-colors duration-150 hover:text-white"
        >
          <span>{next.name}</span>
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className="h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1"
          />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
