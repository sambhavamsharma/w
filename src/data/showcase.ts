import type { StaticImageData } from "next/image";

import citrus from "@/assets/slides/01-editorial-glow.jpg";
import teaTree from "@/assets/slides/02-rose-dream.jpg";
import lavender from "@/assets/slides/03-violet-mystique.jpg";
import goldenHour from "@/assets/slides/04-golden-hour.jpg";

export interface Showcase {
  /** Wordmark set over the mosaic. */
  eyebrow: string;
  /**
   * Revealed a word at a time as the section is scrolled. Placeholder copy —
   * swap it for the real thing.
   */
  body: string;
  /** Fills the frame at the start, then recedes into the mosaic. */
  centre: StaticImageData;
  /** The eight tiles the centre image recedes to expose, clockwise from top-left. */
  surround: StaticImageData[];
}

export const showcase: Showcase = {
  eyebrow: "Washela",
  body:
    "A hand wash range in three scents. Citrus, tea tree and lavender, " +
    "each made for the quiet part of the day.",
  centre: lavender,
  surround: [citrus, teaTree, goldenHour, citrus, teaTree, goldenHour, lavender, citrus],
};

export interface PanelSlide {
  image: StaticImageData;
  title: string;
  alt: string;
}

export interface Panel {
  id: string;
  /** The single word set in the middle of the panel. */
  title: string;
  tone: "olive" | "deep";
  /** When present, the panel carries the carousel under its title. */
  carousel?: PanelSlide[];
}

/**
 * The panels that close the page. The first rises over the pinned mosaic;
 * the second follows it in normal flow.
 */
export const panels: Panel[] = [
  {
    id: "range",
    title: "Range",
    tone: "olive",
    carousel: [
      { image: citrus, title: "Citrus", alt: "Washela citrus hand wash." },
      { image: teaTree, title: "Tea Tree", alt: "Washela tea tree hand wash." },
      { image: lavender, title: "Lavender", alt: "Washela lavender hand wash." },
      { image: goldenHour, title: "Golden Hour", alt: "Backlit profile at sunset." },
    ],
  },
  { id: "connect", title: "Connect", tone: "deep" },
];
