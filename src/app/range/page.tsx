"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import citrus from "@/assets/slides/01-editorial-glow.png";
import teaTree from "@/assets/slides/02-rose-dream.png";
import lavender from "@/assets/slides/03-violet-mystique.png";
import { brandmark } from "@/data/slides";
import {
  WheelCarousel,
  type WheelCarouselItem,
} from "@/components/ui/wheel-carousel";

interface RangeProduct extends WheelCarouselItem {
  description: string;
}

// Same three categories, and the same photo-to-category pairing, as the
// homepage's own Range carousel (src/data/showcase.ts) — the photography
// is scent-shoot, not product-shoot, so it doesn't literally match every
// label, but that pairing is already the site's convention.
const PRODUCTS: RangeProduct[] = [
  {
    label: "Hand Wash",
    image: citrus,
    alt: "Washela hand wash, tea tree, beside a glass dish and sprig of leaves.",
    description:
      "Gentle enough for a dozen washes a day, and it never leaves your hands feeling stripped.",
  },
  {
    label: "Dish Wash",
    image: teaTree,
    alt: "Washela dish wash, citrus, with fresh limes and mint.",
    description:
      "Cuts through grease fast and rinses clean, without the harsh chemical sting.",
  },
  {
    label: "Floor Cleaner",
    image: lavender,
    alt: "Washela floor cleaner, lavender, beside sprigs of lavender.",
    description:
      "A streak-free shine and a scent that lingers quietly from room to room.",
  },
].map((p) => ({ ...p, imageAlt: p.alt }));

export default function RangePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = PRODUCTS[activeIndex]!;

  return (
    <main className="flex h-screen h-dvh flex-col overflow-hidden bg-[#0a0d0a] text-white">
      <header className="flex items-center justify-between px-5 py-6 sm:px-10">
        <Link href="/" aria-label="Washela home">
          <Image
            src={brandmark.image}
            alt={brandmark.alt}
            className="h-6 w-auto brightness-0 invert sm:h-7"
            sizes="140px"
            priority
            draggable={false}
          />
        </Link>
        <Link
          href="/#contact"
          className="text-sm text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          Contact
        </Link>
      </header>

      <div className="px-5 sm:px-10">
        <h1 className="text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
          Range
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
          Hand wash, dish wash and floor cleaner — scroll or drag to pick one.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <WheelCarousel
          items={PRODUCTS}
          activeIndex={activeIndex}
          onActiveChange={(_, index) => setActiveIndex(index)}
          className="min-h-0 flex-1"
          photoWidth={60}
          photoAspect="3/4"
          contentWidth={1400}
        />

        <p
          key={active.label}
          className="mx-auto max-w-md shrink-0 px-5 pt-4 pb-6 text-center text-sm leading-relaxed text-white/55"
        >
          {active.description}
        </p>
      </div>
    </main>
  );
}
