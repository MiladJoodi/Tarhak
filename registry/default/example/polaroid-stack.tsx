"use client";

import { cn } from "@/lib/utils";

export type FanCard = {
  src: string;
  alt: string;
  hoverClassName: string;
};

const cardClassName = cn(
  "absolute top-1/2 left-1/2 h-[226px] w-[152px] -translate-x-1/2 -translate-y-1/2",
  "z-[100] origin-bottom-right overflow-hidden rounded-[8%] border-[5px] border-b-[40px] border-white bg-[#ebebeb]",
  "[scale:1] [transform:rotate(0deg)_translate(0px,-8px)] shadow-[#c7c7c7_2px_2px_4px]",
  "transition-[transform,scale] duration-200 ease",
  "group-has-[:hover]:z-[110] hover:z-[110]",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:[scale:1.1]",
  "motion-reduce:transition-none motion-reduce:[transform:rotate(0deg)_translate(0px,-8px)] motion-reduce:hover:[scale:1]"
);

const fanCards: FanCard[] = [
  {
    src: "https://images.pexels.com/photos/5995712/pexels-photo-5995712.jpeg",
    alt: "کارت پرترهٔ کلوزآپ",
    hoverClassName:
      "[@media(hover:hover)_and_(pointer:fine)]:group-has-[:hover]:[transform:rotate(54deg)_translate(0px,-8px)]",
  },
  {
    src: "https://images.pexels.com/photos/19259515/pexels-photo-19259515.jpeg",
    alt: "کارت پرترهٔ ادیتوریال",
    hoverClassName:
      "[@media(hover:hover)_and_(pointer:fine)]:group-has-[:hover]:[transform:rotate(36deg)_translate(0px,-8px)]",
  },
  {
    src: "https://images.pexels.com/photos/8765790/pexels-photo-8765790.jpeg",
    alt: "کارت پرترهٔ لایف‌استایل",
    hoverClassName:
      "[@media(hover:hover)_and_(pointer:fine)]:group-has-[:hover]:[transform:rotate(18deg)_translate(0px,-8px)]",
  },
  {
    src: "https://images.pexels.com/photos/16611954/pexels-photo-16611954.jpeg",
    alt: "کارت پرترهٔ وسط",
    hoverClassName:
      "[@media(hover:hover)_and_(pointer:fine)]:group-has-[:hover]:[transform:rotate(0deg)_translate(0px,-8px)]",
  },
  {
    src: "https://images.pexels.com/photos/2354863/pexels-photo-2354863.jpeg",
    alt: "کارت پرترهٔ فضای باز",
    hoverClassName:
      "[@media(hover:hover)_and_(pointer:fine)]:group-has-[:hover]:[transform:rotate(-18deg)_translate(0px,-8px)]",
  },
  {
    src: "https://images.pexels.com/photos/28367850/pexels-photo-28367850.jpeg",
    alt: "کارت پرترهٔ مد",
    hoverClassName:
      "[@media(hover:hover)_and_(pointer:fine)]:group-has-[:hover]:[transform:rotate(-36deg)_translate(0px,-8px)]",
  },
  {
    src: "https://images.pexels.com/photos/15295562/pexels-photo-15295562.jpeg",
    alt: "کارت پرترهٔ استودیو",
    hoverClassName:
      "[@media(hover:hover)_and_(pointer:fine)]:group-has-[:hover]:[transform:rotate(-54deg)_translate(0px,-8px)]",
  },
];

export const PolaroidStack = () => {
  return (
    <section
      aria-label="کارت‌های عکس بادبزنی"
      className="relative flex h-[560px] w-full touch-manipulation items-center justify-center overflow-hidden font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
      dir="rtl"
      lang="fa"
    >
      <div className="group relative h-full w-full">
        {fanCards.map(({ alt, hoverClassName, src }) => (
          <div className={cn(cardClassName, hoverClassName)} key={src}>
            <img
              alt={alt}
              className="h-full w-full object-cover"
              draggable={false}
              loading="lazy"
              src={src}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PolaroidStack;
