import type { StaticImageData } from "next/image";

import logo from "@/assets/slides/logo.png";
import editorialGlow from "@/assets/slides/01-editorial-glow.jpg";
import roseDream from "@/assets/slides/02-rose-dream.jpg";
import violetMystique from "@/assets/slides/03-violet-mystique.jpg";
import goldenHour from "@/assets/slides/04-golden-hour.jpg";

export interface Slide {
  /** Stable key. */
  id: string;
  /** Zero-padded ordinal shown in the navigation, e.g. "01". */
  index: string;
  /** Uppercase category name shown in the bottom navigation. */
  title: string;
  image: StaticImageData;
  alt: string;
  /**
   * CSS object-position for this frame. Full-bleed crops shift a lot between
   * a wide desktop and a portrait phone, so each image names its own subject.
   */
  focus: string;
}

export const slides: Slide[] = [
  {
    id: "editorial-glow",
    index: "01",
    title: "Editorial Glow",
    image: editorialGlow,
    alt: "Portrait held in amber light against a burnt-orange ground.",
    focus: "50% 42%",
  },
  {
    id: "rose-dream",
    index: "02",
    title: "Rose Dream",
    image: roseDream,
    alt: "Portrait washed in rose and magenta light against a dark thicket.",
    focus: "50% 40%",
  },
  {
    id: "violet-mystique",
    index: "03",
    title: "Violet Mystique",
    image: violetMystique,
    alt: "Figure leaning on a shutter under violet and teal street light.",
    focus: "38% 50%",
  },
  {
    id: "golden-hour",
    index: "04",
    title: "Golden Hour",
    image: goldenHour,
    alt: "Backlit profile at sunset, hair catching the last of the light.",
    focus: "56% 46%",
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
