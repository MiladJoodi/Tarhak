import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { RootProvider } from "fumadocs-ui/provider/next";
import NextTopLoader from "nextjs-toploader";
import {
  AUTHOR_NAME,
  BRAND_NAME,
  FAVICON_PATH,
  LINKEDIN_URL,
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  SHELL_BG,
  SITE_URL,
} from "@/lib/brand";
import { estedad } from "./fonts/estedad";
import "./globals.css";
import "@/styles/dialkit.css";

const siteTitle = `${BRAND_NAME} | کامپوننت‌های متحرک React`;
const siteDescription =
  "کامپوننت‌های رایگان React با انیمیشن، ساخته‌شده با Motion و Tailwind. پیش‌نمایش کنید، کد را بردارید و به سایتتان اضافه کنید.";

const ogImages = [
  {
    url: OG_IMAGE_PATH,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt: OG_IMAGE_ALT,
  },
] as const;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: SHELL_BG,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: `%s - ${BRAND_NAME}`,
  },
  description: siteDescription,
  authors: [{ name: AUTHOR_NAME, url: LINKEDIN_URL }],
  creator: BRAND_NAME,
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: FAVICON_PATH, type: "image/png" }],
    shortcut: FAVICON_PATH,
    apple: [{ url: FAVICON_PATH, type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND_NAME,
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    title: siteTitle,
    description: siteDescription,
    siteName: BRAND_NAME,
    images: [...ogImages],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [OG_IMAGE_PATH],
    creator: "@MiladJoodi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Tarhak ships one theme. `dark` is rendered by the server so the
    // first paint is already correct — no inline script, no hydration flash,
    // and no OS `prefers-color-scheme` path that could resolve to light.
    <html
      lang="en"
      className={`dark ${estedad.variable} ${geistSans.variable} ${geistMono.variable}`}
      style={{ backgroundColor: SHELL_BG }}
    >
      <body
        className={`${estedad.className} flex min-h-svh flex-col antialiased`}
        style={{ backgroundColor: SHELL_BG }}
      >
        {/* theme.enabled: false drops next-themes entirely — it is what wrote
            `html.light` from localStorage/system, and it also registered a
            bare `d` keydown listener on window that toggled the theme. */}
        <NextTopLoader
          color="#ffffff"
          height={2}
          showSpinner={false}
          crawl
          speed={200}
          zIndex={9999}
        />
        <RootProvider search={{ enabled: false }} theme={{ enabled: false }}>
          {children}
        </RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
