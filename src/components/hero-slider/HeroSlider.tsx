"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

import type { Brandmark as BrandmarkData, Slide } from "@/data/slides";
import { BottomNav } from "./BottomNav";
import { Brandmark } from "./Brandmark";
import { BANDS, Curtain } from "./Curtain";
import { SlideContent } from "./SlideContent";
import styles from "./HeroSlider.module.css";
import { useHeroSlider } from "./useHeroSlider";

export interface HeroSliderProps {
  slides: Slide[];
  /** Logo shown top-left. Omit to leave that corner empty. */
  brandmark?: BrandmarkData;
  /** Whole transition length in ms: first band moving to last band landing. */
  duration?: number;
  /** Set to false to turn autoplay off entirely. */
  autoplay?: boolean;
  autoplayDelay?: number;
}

export function HeroSlider({
  slides,
  brandmark,
  duration = 1150,
  autoplay = true,
  autoplayDelay = 4500,
}: HeroSliderProps) {
  const count = slides.length;
  const {
    current,
    incoming,
    active,
    direction,
    axis,
    transitionId,
    isDragging,
    reducedMotion,
    autoplayRunning,
    rootRef,
    pointerHandlers,
  } = useHeroSlider({ count, duration, autoplay, autoplayDelay });

  if (count === 0) return null;

  const activeSlide = slides[active];
  const total = String(count).padStart(2, "0");

  // Each band travels for part of the whole; the rest is spent waiting its
  // turn, so the last band still lands on time.
  const travel = duration * 0.6;
  const stagger = (duration - travel) / (BANDS - 1);

  const rootStyle = {
    "--dur": `${duration}ms`,
    "--autoplay": `${autoplayDelay}ms`,
    "--travel": `${Math.round(travel)}ms`,
    "--stagger": `${Math.round(stagger)}ms`,
  } as CSSProperties;

  return (
    <section
      ref={rootRef}
      className={styles.root}
      style={rootStyle}
      data-dragging={isDragging ? "true" : "false"}
      data-motion={reducedMotion ? "reduced" : "full"}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured work"
      tabIndex={0}
      {...pointerHandlers}
    >
      <div className={styles.stage}>
        {slides.map((slide, index) => {
          const isCurrent = index === current;
          return (
            <div
              key={slide.id}
              className={styles.slide}
              data-role={isCurrent ? "current" : "parked"}
              aria-hidden={isCurrent ? undefined : true}
            >
              <Image
                className={styles.image}
                src={slide.image}
                alt={slide.alt}
                fill
                sizes="100vw"
                quality={85}
                priority={index === 0}
                // The bands carry a fully formed frame in, so every slide has
                // to be decoded before it is ever shown.
                loading={index === 0 ? undefined : "eager"}
                placeholder="blur"
                draggable={false}
                style={{ objectPosition: slide.focus }}
              />
              <SlideContent slide={slide} />
            </div>
          );
        })}
      </div>

      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.ui}>
        {brandmark ? <Brandmark brandmark={brandmark} /> : null}

        <span
          className={`${styles.edge} ${styles.edgeLeft} ${styles.label}`}
          aria-hidden="true"
        >
          {activeSlide.index}
        </span>
        <span
          className={`${styles.edge} ${styles.edgeRight} ${styles.label}`}
          aria-hidden="true"
        >
          {total}
        </span>

        <BottomNav slides={slides} current={active} timing={autoplayRunning} />
      </div>

      {incoming === null ? null : (
        <Curtain
          key={transitionId}
          slide={slides[incoming]}
          axis={axis}
          direction={direction}
        />
      )}

      <p className={styles.srOnly} aria-live="polite">
        {`Slide ${active + 1} of ${count}: ${activeSlide.title}`}
      </p>
    </section>
  );
}
