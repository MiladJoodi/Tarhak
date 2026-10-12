"use client";

import { usePathname } from "next/navigation";
import NextTopLoader from "nextjs-toploader";

/** Skip the global progress bar on in-app component docs — it reads like a stray header stripe. */
export function AppTopLoader() {
  const pathname = usePathname();
  if (pathname.startsWith("/docs/components/")) return null;

  return (
    <NextTopLoader
      color="#ffffff"
      height={2}
      showSpinner={false}
      crawl={false}
      shadow={false}
      speed={200}
      zIndex={9999}
    />
  );
}
