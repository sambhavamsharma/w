"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

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
  /**
   * How many viewports of scrolling the stage occupies. Raise it to draw the
   * whole sequence out, lower it to move through faster.
   */
  runway?: number;
}

/** Share of the stage's travel spent stepping through the cards. */
const CAROUSEL_END = 0.55;
/** Where the curtain starts, leaving a beat on the last card first. */
const CURTAIN_START = 0.62;

/**
 * The Range page, its carousel, and the sweep that carries you off it.
 *
 * The panel is pinned for the whole stage and one scroll position drives the
 * lot: the first stretch steps the carousel through the range a card at a
 * time, then after a beat on the last one a shape in Connect's colour sweeps
 * across. Range hands over to Connect on this page, with nothing in between.
 */
export function RangeStage({
  panel,
  brandmark,
  curtainColor,
  runway = 3.4,
}: RangeStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = panel.carousel?.length ?? 0;

  useEffect(() => {
    const stage = stageRef.current;
    const pin = pinRef.current;
    if (!stage || !pin || count < 2) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const box = stage.getBoundingClientRect();
      // How far the pin actually travels before it lets go, measured rather
      // than assumed: on a phone `window.innerHeight` rides the URL bar and
      // does not match the pin, which left the last card and the sweep still
      // mid-flight when the stage scrolled away.
      const travel = box.height - pin.offsetHeight;
      const scrolled = travel <= 0 ? 0 : Math.min(Math.max(-box.top / travel, 0), 1);
      const through = Math.min(scrolled / CAROUSEL_END, 1);
      setActive(Math.round(through * (count - 1)));
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
  }, [count]);

  return (
    <div
      ref={stageRef}
      id="range"
      className={styles.stage}
      style={{ "--stage-runway-units": runway } as CSSProperties}
    >
      <div ref={pinRef} className={styles.stagePin}>
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
                activeIndex={active}
                // Tapping a card still works; the next scroll re-syncs it.
                onActiveIndexChange={setActive}
              />
            </div>
          ) : null}
        </section>

        <PageCurtain
          color={curtainColor}
          trackRef={stageRef}
          pinRef={pinRef}
          delay={CURTAIN_START}
        />
      </div>
    </div>
  );
}
