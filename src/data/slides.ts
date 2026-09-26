import type { StaticImageData } from "next/image";

import logo from "@/assets/slides/logo.png";
import citrus from "@/assets/slides/01-editorial-glow.png";
import teaTree from "@/assets/slides/02-rose-dream.png";
import lavender from "@/assets/slides/03-violet-mystique.png";
import goldenHour from "@/assets/slides/04-golden-hour.png";

export interface Slide {
  /** Stable key. */
  id: string;
  /** Zero-padded ordinal shown in the navigation, e.g. "01". */
  index: string;
  /** Uppercase category name shown in the bottom navigation. */
  title: string;
  /** The large display word set across the foot of the frame. */
  display: string;
  image: StaticImageData;
  alt: string;
  /**
   * CSS object-position for this frame. Full-bleed crops shift a lot between
   * a wide desktop and a portrait phone, so each image names its own subject.
   */
  focus: string;
  /**
   * Which way this slide's own type reads against its photograph. The frames
   * run from near-white to near-black, so the type colour is per slide rather
   * than a single global choice.
   */
  tone: "light" | "dark";
}

export const slides: Slide[] = [
  {
    id: "citrus",
    index: "01",
    title: "Citrus",
    display: "Citrus",
    image: citrus,
    alt: "Washela citrus hand wash on a pale stone plinth, orange slices beside it.",
    focus: "50% 50%",
    tone: "dark",
  },
  {
    id: "tea-tree",
    index: "02",
    title: "Tea Tree",
    display: "Tea Tree",
    image: teaTree,
    alt: "Washela tea tree hand wash on dark slate with fresh leaves.",
    focus: "50% 50%",
    tone: "light",
  },
  {
    id: "lavender",
    index: "03",
    title: "Lavender",
    display: "Lavender",
    image: lavender,
    alt: "Washela lavender hand wash on a pale plinth with sprigs of lavender.",
    focus: "50% 50%",
    tone: "dark",
  },
  {
    id: "golden-hour",
    index: "04",
    title: "Golden Hour",
    display: "Golden Hour",
    image: goldenHour,
    alt: "Backlit profile at sunset, hair catching the last of the light.",
    focus: "56% 46%",
    tone: "light",
  },
];

export interface Brandmark {
  image: StaticImageData;
  alt: string;
}

/**
 * Sits top-left over the slider. The artwork is black on transparent, so the
 * slider renders it in white — see `.brandmark` in HeroSlider.module.css.
 */
export const brandmark: Brandmark = {
  image: logo,
  alt: "Washela",
};
