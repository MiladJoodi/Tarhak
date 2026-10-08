import type { Metadata } from "next";

import {
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
} from "@/lib/brand";
import "@/styles/browse.css";

const title = "مرور کامپوننت‌های متحرک React - Tarhak";
const description =
  "Look through free animated React components. Hover a card to see it move, then click to copy the code.";

const ogImages = [
  {
    url: OG_IMAGE_PATH,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt: OG_IMAGE_ALT,
  },
];

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: { title, description, images: ogImages },
  twitter: { title, description, images: [OG_IMAGE_PATH] },
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
