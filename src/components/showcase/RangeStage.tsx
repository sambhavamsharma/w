"use client";

import Image from "next/image";
import { useRef } from "react";

import type { Brandmark } from "@/data/slides";
import type { Panel } from "@/data/showcase";
import { PageCurtain } from "./PageCurtain";
import { RangeCarousel } from "./RangeCarousel";
import styles from "./ScrollPanels.module.css";

export interface RangeStageProps {
  panel: Panel;
  brandmark?: Brandmark;
  /** Colour of the page the curtain opens onto. */
  curtainColor: string;
}

/**
 * The Range page and the sweep that carries you off it.
 *
 * The panel is pinned for the whole stage. Scroll on past the carousel and a
 * shape in the next page's colour sweeps across with a curved leading edge, so
 * the hand-off from Range to Connect happens on this page with nothing in
 * between the two.
 */
export function RangeStage({ panel, brandmark, curtainColor }: RangeStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={stageRef} className={styles.stage}>
      <div className={styles.stagePin}>
        {brandmark ? (
          <div className={styles.stageBrandmark}>
            <Image
              className={styles.brandmarkImage}
              src={brandmark.image}
              alt={brandmark.alt}
              sizes="140px"
              draggable={false}
            />
          </div>
        ) : null}

        <section className={styles.panel} data-tone={panel.tone} data-carousel="true">
          <h2 className={styles.title}>{panel.title}</h2>
          {panel.carousel ? (
            <div className={styles.carousel}>
              <RangeCarousel
                items={panel.carousel.map((slide) => ({
                  src: slide.image.src,
                  title: slide.title,
                  alt: slide.alt,
                }))}
              />
            </div>
          ) : null}
        </section>

        <PageCurtain color={curtainColor} trackRef={stageRef} />
      </div>
    </div>
  );
}
