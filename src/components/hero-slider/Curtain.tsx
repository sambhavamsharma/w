import Image from "next/image";
import type { CSSProperties } from "react";

import type { Slide } from "@/data/slides";
import { SlideContent } from "./SlideContent";
import styles from "./HeroSlider.module.css";
import type { Axis, Direction } from "./useHeroSlider";

/**
 * Number of bands. The reference runs four to five wide steps; five reads as
 * a staircase without turning into a fine comb.
 */
export const BANDS = 5;

interface CurtainProps {
  /** The slide the bands are carrying in. */
  slide: Slide;
  /** Columns from the foot ("y") or rows from the side ("x"). */
  axis: Axis;
  direction: Direction;
}

/**
 * The bands that carry a slide in. Each one is a full-frame copy of the
 * incoming slide, clipped to its own strip, and each strip opens a beat after
 * the one before — so the new photograph builds up as a staircase rather than
 * arriving all at once. Nothing here is a plain colour: the band *is* the next
 * image.
 */
export function Curtain({ slide, axis, direction }: CurtainProps) {
  return (
    <div className={styles.curtain} data-axis={axis} data-dir={direction} aria-hidden="true">
      {Array.from({ length: BANDS }, (_, index) => {
        const near = `${(index / BANDS) * 100}%`;
        const far = `${((BANDS - 1 - index) / BANDS) * 100}%`;
        const step = direction === 1 ? index : BANDS - 1 - index;

        const bounds =
          axis === "y" ? { "--l": near, "--r": far } : { "--t": near, "--b": far };
        const style = { "--step": step, ...bounds } as unknown as CSSProperties;

        return (
          <div key={index} className={styles.band} style={style}>
            <Image
              className={styles.image}
              src={slide.image}
              alt=""
              fill
              sizes="100vw"
              quality={85}
              draggable={false}
              style={{ objectPosition: slide.focus }}
            />
            <SlideContent slide={slide} />
          </div>
        );
      })}
    </div>
  );
}
