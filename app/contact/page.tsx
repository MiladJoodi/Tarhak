import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "تماس",
  description: "دربارهٔ طرحک، ابزارهای دیگر و راه‌های تماس.",
};

const tools = [
  {
    name: "طرحک",
    href: "/",
    blurb: "کامپوننت‌های متحرک ری‌اکت برای ساخت رابط‌های صیقل‌خورده.",
    src: "/landing/tool-react.png",
  },
  {
    name: "FarsiUI",
    href: "https://farsiui.ir",
    blurb: "رجیستری و CLI برای افزودن کامپوننت‌های فارسی به پروژه‌تان.",
    src: "/landing/tool-farsiui.svg",
    external: true,
  },
] as const;

const contacts = [
  {
    label: "ایمیل",
    value: "hello@uselayouts.com",
    href: "mailto:hello@uselayouts.com",
  },
  {
    label: "گیت‌هاب",
    value: "github.com/iurvish/uselayouts",
    href: "https://github.com/iurvish/uselayouts",
  },
] as const;

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <header className="flex max-w-[36rem] flex-col gap-4">
        <h1 className="text-[36px] leading-[1.2] tracking-normal text-[#071A31] sm:text-[48px]">
          تماس با ما
        </h1>
        <p className="text-[16px] leading-[1.7] text-[#4B565E]">
          طرحک مجموعه‌ای از کامپوننت‌های UI است. اگر سؤال، پیشنهاد یا همکاری دارید،
          از راه‌های زیر بنویسید. ابزارهای دیگرمان را هم همین‌جا می‌بینید.
        </p>
      </header>

      <section className="mt-14" aria-labelledby="tools-heading">
        <h2
          id="tools-heading"
          className="text-[22px] font-medium leading-8 tracking-normal text-[#071A31]"
        >
          ابزارهای ما
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => {
            const inner = (
              <>
                <span
                  className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#F9F8F6] shadow-[inset_0_0_0_1px_#fff,0_1px_3px_rgba(102,102,102,0.1)]"
                  aria-hidden
                >
                  <Image
                    src={tool.src}
                    alt=""
                    width={36}
                    height={36}
                    unoptimized={tool.src.endsWith(".svg")}
                    className="size-9 object-contain"
                  />
                </span>
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[17px] font-medium text-[#071A31]">
                    {tool.name}
                  </span>
                  <span className="text-[14px] leading-[1.6] text-[#4B565E]">
                    {tool.blurb}
                  </span>
                </span>
              </>
            );

            const className =
              "flex items-start gap-4 rounded-2xl border border-[#E2E2E2] bg-white p-5 transition-[border-color,box-shadow] duration-150 hover:border-[#071A31]/25 hover:shadow-sm";

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
          className="text-[22px] font-medium leading-8 tracking-normal text-[#071A31]"
        >
          راه‌های تماس
        </h2>
        <ul className="mt-6 flex flex-col gap-3">
          {contacts.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                {...(item.href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                className="flex flex-col gap-1 rounded-2xl border border-[#E2E2E2] bg-white px-5 py-4 transition-[border-color] duration-150 hover:border-[#071A31]/25 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span className="text-[14px] text-[#4B565E]">{item.label}</span>
                <span
                  dir="ltr"
                  className="text-[15px] font-medium text-[#071A31]"
                >
                  {item.value}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
