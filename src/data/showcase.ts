import type { StaticImageData } from "next/image";

import citrus from "@/assets/slides/01-editorial-glow.png";
import teaTree from "@/assets/slides/02-rose-dream.png";
import lavender from "@/assets/slides/03-violet-mystique.png";
import goldenHour from "@/assets/slides/04-golden-hour.png";

// The mosaic's own photos, one per grid cell — dropped in as they arrive.
// Cells without one yet still fall back to the range photos above.
import mosaicTopLeft from "@/assets/mosaic/mosaic-top-left.png";
import mosaicTop from "@/assets/mosaic/mosaic-top.png";
import mosaicTopRight from "@/assets/mosaic/mosaic-top-right.png";
import mosaicLeft from "@/assets/mosaic/mosaic-left.png";
import mosaicCenter from "@/assets/mosaic/mosaic-center.png";
import mosaicRight from "@/assets/mosaic/mosaic-right.png";

/** The nine boxes of the mosaic, by position in the grid. */
export type MosaicCell =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export interface MosaicTile {
  /** Which box this fills. Each one takes its own picture. */
  cell: MosaicCell;
  image: StaticImageData;
  /**
   * Optional CSS object-position. The edge boxes are narrow strips, so a
   * picture often needs telling where its subject sits.
   */
  focus?: string;
}

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
  /** The eight boxes the centre picture recedes to expose. */
  tiles: MosaicTile[];
}

export const showcase: Showcase = {
  eyebrow: "Washela",
  body:
    "Hand wash, dish wash and floor cleaner. Everyday essentials, " +
    "made gentle and scented for the quiet part of the day.",

  centre: mosaicCenter,

  // One line per box, each pointed at its own file. Cells still waiting on
  // their photo fall back to a range shot for now — swap the fallback for
  // the real file (see the mosaic/ import above) as each one arrives.
  tiles: [
    { cell: "top-left", image: mosaicTopLeft },
    { cell: "top", image: mosaicTop },
    { cell: "top-right", image: mosaicTopRight },
    { cell: "left", image: mosaicLeft },
    { cell: "right", image: mosaicRight },
    { cell: "bottom-left", image: lavender },
    { cell: "bottom", image: goldenHour },
    { cell: "bottom-right", image: citrus },
  ],
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

/** The deep panel's colour, used by the curtain that sweeps Range into Connect. */
export const deepTone = "#181c11";
