import type { StaticImageData } from "next/image";

import citrus from "@/assets/slides/01-editorial-glow.png";
import teaTree from "@/assets/slides/02-rose-dream.png";
import lavender from "@/assets/slides/03-violet-mystique.png";

export interface Fragrance {
  id: string;
  /** Zero-padded ordinal shown beside the name, e.g. "01". */
  index: string;
  name: string;
  description: string;
  image: StaticImageData;
  alt: string;
  focus: string;
  /** Short ingredient callout for the hero's second marker, e.g. "Cold-Pressed Citrus". */
  note: string;
  /** The scent's own colour — lights the "Scents," word in the hero headline. */
  accent: string;
}

export const fragrances: Fragrance[] = [
  {
    id: "citrus",
    index: "01",
    name: "Citrus",
    description:
      "Cold-pressed orange and a curl of peel. Sharp and bright — the first wash of the day.",
    image: citrus,
    alt: "Washela citrus hand wash on a pale stone plinth, orange slices beside it.",
    focus: "50% 50%",
    note: "Cold-Pressed Citrus",
    accent: "#f0921e",
  },
  {
    id: "tea-tree",
    index: "02",
    name: "Tea Tree",
    description:
      "Cool and faintly green, with a clean medicinal edge. The one that means business.",
    image: teaTree,
    alt: "Washela tea tree hand wash on dark slate with fresh leaves.",
    focus: "50% 50%",
    note: "Pure Tea Tree Oil",
    accent: "#4d9a35",
  },
  {
    id: "lavender",
    index: "03",
    name: "Lavender",
    description:
      "Dried petals and a low, powdery hush. Made for the last wash of the day.",
    image: lavender,
    alt: "Washela lavender hand wash on a pale plinth with sprigs of lavender.",
    focus: "50% 50%",
    note: "Hand-Tied Lavender",
    accent: "#8064b8",
  },
];
