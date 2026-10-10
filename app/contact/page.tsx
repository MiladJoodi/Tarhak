import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  BRAND_NAME_FA,
  CONTACT_EMAIL,
  GITHUB_PROFILE_URL,
  LINKEDIN_URL,
  X_URL,
} from "@/lib/brand";

export const metadata: Metadata = {
  title: "تماس",
  description: `دربارهٔ ${BRAND_NAME_FA}، ابزارهای دیگر و ارتباط مستقیم.`,
};

const tools = [
  {
    name: BRAND_NAME_FA,
    href: "/",
    blurb: "کامپوننت‌های متحرک ری‌اکت برای ساخت رابط‌های صیقل‌خورده.",
    src: "/tarhak/favicon.png",
  },
  {
    name: "FarsiUI",
    href: "https://farsiui.ir",
    blurb: "رجیستری و CLI برای افزودن کامپوننت‌های فارسی به پروژه‌تان.",
    src: "/tarhak/FarsiUI.png",
    external: true,
  },
  {
    name: "MockData",
    href: "https://mockdata.ir",
    blurb:
      "API و JSON آماده برای پروتوتایپ و تست فرانت — بدون راه‌اندازی بک‌اند.",
    src: "/tarhak/mockdata.png",
    external: true,
  },
  {
    name: "Endpoints",
    href: "https://endpoints.ir",
    blurb: "کلاینت سبک برای فراخوانی و تست endpointها؛ جایگزین سادهٔ Postman.",
    src: "/tarhak/endponts.svg",
    external: true,
  },
] as const;

const directLinks = [
  {
    label: "ایمیل",
    href: `mailto:${CONTACT_EMAIL}`,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 6.75A1.75 1.75 0 0 1 5.75 5h12.5A1.75 1.75 0 0 1 20 6.75v10.5A1.75 1.75 0 0 1 18.25 19H5.75A1.75 1.75 0 0 1 4 17.25V6.75Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="m5 7 7 5.5L19 7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "گیت‌هاب",
    href: GITHUB_PROFILE_URL,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.339-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.378.203 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.936.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.01 10.01 0 0 0 22 12c0-5.523-4.477-10-10-10Z" />
      </svg>
    ),
  },
  {
    label: "ایکس",
    href: X_URL,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L2.25 2.25h6.908l4.261 5.691 4.825-5.691Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
      </svg>
    ),
  },
  {
    label: "لینکدین",
    href: LINKEDIN_URL,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4.98 3.5C4.98 4.881 3.87 6 2.5 6S.02 4.881.02 3.5C.02 2.12 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.25h4.56V23H.22V8.25zM8.34 8.25h4.37v2.01h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V23h-4.56v-6.2c0-1.48-.03-3.38-2.06-3.38-2.06 0-2.38 1.61-2.38 3.27V23H8.34V8.25z" />
      </svg>
    ),
  },
] as const;

export default function ContactPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-[900px] flex-1 px-4 pt-[5.75rem] pb-12 sm:px-8 sm:pt-[6.5rem] sm:pb-16 lg:px-12 lg:pb-20">
      <header className="flex max-w-[36rem] flex-col gap-4">
        <h1 className="text-[36px] leading-[1.2] tracking-normal text-white sm:text-[48px]">
          تماس با ما
        </h1>
        <p className="text-[16px] leading-[1.7] text-white/70">
          اگر سؤال، پیشنهاد یا همکاری دارید، با ما در ارتباط باشید. ابزارهای دیگرمان را هم همین‌جا می‌بینید.
        </p>
      </header>

      <section className="mt-14" aria-labelledby="tools-heading">
        <h2
          id="tools-heading"
          className="text-[22px] font-medium leading-8 tracking-normal text-white"
        >
          ابزارهای ما
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => {
            const inner = (
              <>
                <span
                  className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                  aria-hidden
                >
                  <Image
                    src={tool.src}
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 object-contain"
                  />
                </span>
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[17px] font-medium text-white">
                    {tool.name}
                  </span>
                  <span className="text-[14px] leading-[1.6] text-white/65">
                    {tool.blurb}
                  </span>
                </span>
              </>
            );

            const className =
              "flex items-start gap-4 rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-md transition-[border-color,background-color] duration-150 hover:border-white/22 hover:bg-white/[0.1]";

            if ("external" in tool && tool.external) {
              return (
                <li key={tool.name}>
                  <a
                    href={tool.href}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                  >
                    {inner}
                  </a>
                </li>
              );
            }

            return (
              <li key={tool.name}>
                <Link href={tool.href} className={className}>
                  {inner}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="contact-heading">
        <h2
          id="contact-heading"
          className="text-[22px] font-medium leading-8 tracking-normal text-white"
        >
          ارتباط مستقیم
        </h2>
        <ul className="mt-5 flex flex-wrap items-center gap-y-1">
          {directLinks.map((item, index) => (
            <li key={item.label} className="flex items-center">
              {index > 0 ? (
                <span
                  aria-hidden
                  className="mx-1.5 size-1 shrink-0 rounded-full bg-white/35"
                />
              ) : null}
              <a
                href={item.href}
                {...(item.href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                aria-label={item.label}
                className="inline-flex size-8 items-center justify-center rounded-full text-white/90 transition-opacity duration-150 hover:opacity-60"
              >
                {item.icon}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
