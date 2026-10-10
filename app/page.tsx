import type { Metadata } from "next";

import ComingSoon from "@/components/landing/coming-soon";
import { BRAND_NAME_FA } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${BRAND_NAME_FA} — به‌زودی`,
  description: `${BRAND_NAME_FA} به‌زودی معرفی می‌شود.`,
};

export default function Page() {
  return <ComingSoon />;
}
