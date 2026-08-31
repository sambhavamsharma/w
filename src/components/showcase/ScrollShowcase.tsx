"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import type { Showcase } from "@/data/showcase";
import styles from "./ScrollShowcase.module.css";

export interface ScrollShowcaseProps {
  showcase: Showcase;
  /**
   * Viewports of scrolling spent opening the mosaic and lighting the sentence.
   */
  runway?: number;
  /** Viewports the finished frame rests for before the panel rises over it. */
  hold?: number;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * A pinned frame driven by scroll position.
 *
 * The centre photograph starts full-bleed and draws back to expose a mosaic
 * of the range around it, while the sentence over the top lights up a word at
 * a time. Both are read from a single `--p` (0 to 1) written to the section on
 * scroll, so the whole thing is CSS from there on and nothing animates per
 * frame in JavaScript.
 */
export function ScrollShowcase({
  showcase,
  runway = 1.6,
  hold = 0.4,
}: ScrollShowcaseProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const words = showcase.body.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Reduced motion gets the settled state outright, with no scroll coupling.
    if (reducedMotion) {
      section.style.setProperty("--p", "1");
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const box = section.getBoundingClientRect();
      // Held back at the end: the pinned viewport itself, the rest beat, and
      // the viewport the panel needs to rise over the top. What is left is the
      // distance the pull-back actually runs over.
      const travel = box.height - window.innerHeight * (hold + 2);
      const progress = travel <= 0 ? 1 : Math.min(Math.max(-box.top / travel, 0), 1);
      section.style.setProperty("--p", progress.toFixed(4));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion, hold]);

  const style = {
    "--runway": `${(runway + hold + 2) * 100}vh`,
    "--words": words.length,
  } as CSSProperties;

  return (
    <section ref={sectionRef} className={styles.section} style={style}>
      <div className={styles.pin}>
        <div className={styles.mosaic}>
          {showcase.tiles.map((tile) => (
            <div key={tile.cell} className={styles.tile} data-cell={tile.cell}>
              <Image
                className={styles.image}
                src={tile.image}
                alt=""
                fill
                sizes="20vw"
                quality={70}
                draggable={false}
                style={tile.focus ? { objectPosition: tile.focus } : undefined}
              />
            </div>
          ))}

          <div className={styles.centre}>
            <Image
              className={styles.image}
              src={showcase.centre}
              alt=""
              fill
              sizes="100vw"
              quality={85}
              draggable={false}
            />
          </div>
        </div>

        <div className={styles.overlay}>
          <span className={styles.eyebrow}>{showcase.eyebrow}</span>
          <p className={styles.body}>
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className={styles.word}
                style={{ "--i": index } as CSSProperties}
              >
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
