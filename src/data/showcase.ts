import type { StaticImageData } from "next/image";

import citrus from "@/assets/slides/01-editorial-glow.jpg";
import teaTree from "@/assets/slides/02-rose-dream.jpg";
import lavender from "@/assets/slides/03-violet-mystique.jpg";
import goldenHour from "@/assets/slides/04-golden-hour.jpg";

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
    "A hand wash range in three scents. Citrus, tea tree and lavender, " +
    "each made for the quiet part of the day.",

  centre: lavender,

  // One line per box. Point each at its own file — several repeat for now
  // because there are only four photographs in the project.
  tiles: [
    { cell: "top-left", image: citrus },
    { cell: "top", image: teaTree },
    { cell: "top-right", image: goldenHour },
    { cell: "left", image: citrus },
    { cell: "right", image: teaTree },
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
