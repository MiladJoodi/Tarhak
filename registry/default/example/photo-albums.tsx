"use client"

import React, { useState, useId } from "react"
import { motion, LayoutGroup } from "motion/react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Photo {
  id: string
  src: string
}

interface Collection {
  id: string
  title: string
  subtitle: string
  photos: Photo[]
}

const COLLECTIONS: Collection[] = [
  {
    id: "c1",
    title: "سفر و کاوش",
    subtitle: "خصوصی",
    photos: [
      {
        id: "p1-1",
        src: "/unsplash/1501785888041-af3ef285b470.webp",
      },
      {
        id: "p1-2",
        src: "/unsplash/1476514525535-07fb3b4ae5f1.webp",
      },
      {
        id: "p1-3",
        src: "/unsplash/1469474968028-56623f02e42e.webp",
      },
      {
        id: "p1-4",
        src: "/unsplash/1447752875215-b2761acb3c5d.webp",
      },
      {
        id: "p1-5",
        src: "/unsplash/1470770841072-f978cf4d019e.webp",
      },
      {
        id: "p1-6",
        src: "/unsplash/1501854140801-50d01698950b.webp",
      },
    ],
  },
  {
    id: "c2",
    title: "طراحی صنعتی",
    subtitle: "خصوصی",
    photos: [
      {
        id: "p2-1",
        src: "/unsplash/1518457607834-6e8d80c183c5.webp",
      },
      {
        id: "p2-2",
        src: "/unsplash/1518770660439-4636190af475.webp",
      },
      {
        id: "p2-3",
        src: "/unsplash/1518495973542-4542c06a5843.webp",
      },
      {
        id: "p2-4",
        src: "/unsplash/1519389950473-47ba0277781c.webp",
      },
      {
        id: "p2-5",
        src: "/unsplash/1498050108023-c5249f4df085.webp",
      },
      {
        id: "p2-6",
        src: "/unsplash/1488590528505-98d2b5aba04b.webp",
      },
    ],
  },
  {
    id: "c3",
    title: "معماری مدرن",
    subtitle: "خصوصی",
    photos: [
      {
        id: "p3-1",
        src: "/unsplash/1486406146926-c627a92ad1ab.webp",
      },
      {
        id: "p3-2",
        src: "/unsplash/1497366216548-37526070297c.webp",
      },
      {
        id: "p3-3",
        src: "/unsplash/1497215728101-856f4ea42174.webp",
      },
      {
        id: "p3-4",
        src: "/unsplash/1488972685288-c3fd157d7c7a.webp",
      },
      {
        id: "p3-5",
        src: "/unsplash/1487958449943-2429e8be8625.webp",
      },
      {
        id: "p3-6",
        src: "/unsplash/1486325212027-8081e485255e.webp",
      },
    ],
  },
  {
    id: "c4",
    title: "هنر انتزاعی",
    subtitle: "عمومی",
    photos: [
      {
        id: "p4-1",
        src: "/unsplash/1518640467707-6811f4a6ab73.webp",
      },
      {
        id: "p4-2",
        src: "/unsplash/1518709268805-4e9042af9f23.webp",
      },
      {
        id: "p4-3",
        src: "/unsplash/1513519245088-0e12902e5a38.webp",
      },
      {
        id: "p4-4",
        src: "/unsplash/1492691527719-9d1e07e534b4.webp",
      },
      {
        id: "p4-5",
        src: "/unsplash/1541701494587-cb58502866ab.webp",
      },
    ],
  },
]

const transition = {
  type: "spring" as const,
  stiffness: 280,
  damping: 32,
  mass: 1,
}

export default function PhotoAlbums() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const layoutGroupId = useId()
  const selectedCollection = COLLECTIONS.find((c) => c.id === selectedId)

  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full min-h-0 w-full flex-col items-center overflow-x-hidden px-8 pt-28 pb-32 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal text-foreground"
    >
      <LayoutGroup id={layoutGroupId}>
        <div
          className={cn(
            "flex w-full max-w-md min-h-0 flex-col",
            selectedId ? "flex-1" : "my-auto",
          )}
        >
          {selectedCollection ? (
            <ExpandedAlbum
              collection={selectedCollection}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-12 gap-y-24">
              {COLLECTIONS.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onClick={() => setSelectedId(collection.id)}
                />
              ))}
            </div>
          )}
        </div>
      </LayoutGroup>
    </div>
  )
}

function ExpandedAlbum({
  collection,
  onBack,
}: {
  collection: Collection
  onBack: () => void
}) {
  const stacked = new Set(collection.photos.slice(0, 3).map((photo) => photo.id))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 pb-5">
        <button
          type="button"
          onClick={onBack}
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-foreground transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          <ChevronRight size={24} strokeWidth={2.5} />
          <span className="sr-only">بازگشت</span>
        </button>

        <motion.h2
          layoutId={`title-${collection.id}`}
          className="min-w-0 flex-1 text-3xl leading-tight font-medium text-balance text-foreground"
          transition={transition}
        >
          {collection.title}
        </motion.h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-visible overscroll-contain">
        <div className="grid grid-cols-2 gap-6 pb-2">
          {collection.photos.map((photo) => (
            <motion.div
              key={photo.id}
              layoutId={`photo-${photo.id}`}
              className="aspect-square overflow-visible rounded-2xl bg-muted ring-1 ring-border"
              initial={stacked.has(photo.id) ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={transition}
            >
              <img
                src={photo.src}
                alt=""
                className="h-full w-full rounded-2xl object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CollectionCard({
  collection,
  onClick,
}: {
  collection: Collection
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group flex cursor-pointer flex-col items-center outline-none select-none"
    >
      <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-visible">
        {collection.photos.slice(0, 3).map((photo, i) => {
          const rotations = [-14, 14, 0]
          const yOffsets = [-2, -2, 0]

          return (
            <motion.div
              key={photo.id}
              layoutId={`photo-${photo.id}`}
              className="absolute h-34 w-34 overflow-visible rounded-3xl bg-muted ring-1 ring-border"
              animate={{ rotate: rotations[i] }}
              whileHover={{
                scale: 1.05,
                y: yOffsets[i] - 5,
                transition: { duration: 0.2 },
              }}
              transition={transition}
            >
              <img
                src={photo.src}
                alt=""
                className="pointer-events-none h-full w-full rounded-3xl object-cover select-none"
              />
            </motion.div>
          )
        })}
      </div>
      <motion.h3
        layoutId={`title-${collection.id}`}
        className="px-2 text-center text-base font-medium text-foreground"
        transition={transition}
      >
        {collection.title}
      </motion.h3>
    </motion.button>
  )
}
