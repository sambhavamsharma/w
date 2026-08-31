"use client";

import Image from "next/image";
import { useCallback } from "react";
import type { CSSProperties } from "react";

import type { Brandmark as BrandmarkData, Slide } from "@/data/slides";
import { BottomNav } from "./BottomNav";
import { Brandmark } from "./Brandmark";
import styles from "./HeroSlider.module.css";
import { useHeroSlider, type Axis, type Direction, type Phase } from "./useHeroSlider";

export interface HeroSliderProps {
  slides: Slide[];
  /** Logo shown top-left. Omit to leave that corner empty. */
  brandmark?: BrandmarkData;
  /** Transition length in ms. */
  duration?: number;
  /** Set to false to turn autoplay off entirely. */
  autoplay?: boolean;
  autoplayDelay?: number;
}

/**
 * The transition, as measured off the reference:
 *
 * The incoming slide travels in from one edge as a solid, hard-edged plate and
 * comes to rest covering the frame. The outgoing slide never moves — it simply
 * darkens under a scrim as it is covered, which is what gives the incoming
 * plate the feeling of passing over rather than pushing.
 *
 * The axis alternates every transition: in from the side, then in from the
 * bottom, then the side again.
 */
const SCRIM = 0.58;
/** Fraction of a drag the resting slide follows, so a swipe has some weight. */
const DRAG_FOLLOW = 0.22;

const NO_TRANSITION: CSSProperties = { transition: "none" };

function offset(axis: Axis, percent: number, pixels = 0) {
  const value = `calc(${percent}% + ${pixels.toFixed(2)}px)`;
  return axis === "x"
    ? `translate3d(${value}, 0, 0)`
    : `translate3d(0, ${value}, 0)`;
}

interface SlideStyles {
  outer: CSSProperties;
  scrim: CSSProperties;
  role: "current" | "previous" | "parked";
}

function slideStyles(
  index: number,
  {
    current,
    previous,
    direction,
    phase,
    axis,
    dragOffset,
    isDragging,
    reducedMotion,
  }: {
    current: number;
    previous: number | null;
    direction: Direction;
    phase: Phase;
    axis: Axis;
    dragOffset: number;
    isDragging: boolean;
    reducedMotion: boolean;
  },
): SlideStyles {
  const role =
    index === current ? "current" : index === previous ? "previous" : "parked";

  const dragPx = dragOffset * DRAG_FOLLOW;
  const held: CSSProperties | undefined = isDragging ? NO_TRANSITION : undefined;

  // Reduced motion: no travel, no scrim, just a short cross-dissolve.
  if (reducedMotion) {
    if (role === "parked") {
      return { role, outer: { ...NO_TRANSITION, opacity: 0 }, scrim: NO_TRANSITION };
    }
    return {
      role,
      outer: {
        opacity: role === "current" ? 1 : 0,
        ...(phase === "arm" && role === "current" ? { ...NO_TRANSITION, opacity: 0 } : null),
      },
      scrim: { ...NO_TRANSITION, opacity: 0 },
    };
  }

  if (role === "current") {
    // Parked off the edge it is about to travel in from.
    if (phase === "arm") {
      return {
        role,
        outer: { ...NO_TRANSITION, opacity: 1, transform: offset(axis, direction * 100) },
        scrim: { ...NO_TRANSITION, opacity: 0 },
      };
    }

    return {
      role,
      outer: { ...held, opacity: 1, transform: offset(axis, 0, dragPx) },
      scrim: { ...held, opacity: 0 },
    };
  }

  if (role === "previous") {
    // Holds its ground and darkens. The drag offset is kept so a committed
    // swipe does not snap back underneath the incoming plate.
    return {
      role,
      outer: { ...NO_TRANSITION, opacity: 1, transform: offset(axis, 0, dragPx) },
      scrim: phase === "arm" ? { ...NO_TRANSITION, opacity: 0 } : { opacity: SCRIM },
    };
  }

  return {
    role,
    outer: { ...NO_TRANSITION, opacity: 0, transform: offset(axis, 0) },
    scrim: { ...NO_TRANSITION, opacity: 0 },
  };
}

export function HeroSlider({
  slides,
  brandmark,
  duration = 620,
  autoplay = true,
  autoplayDelay = 4500,
}: HeroSliderProps) {
  const count = slides.length;
  const {
    current,
    previous,
    direction,
    phase,
    axis,
    dragOffset,
    isDragging,
    reducedMotion,
    autoplayRunning,
    rootRef,
    goTo,
    pointerHandlers,
  } = useHeroSlider({ count, duration, autoplay, autoplayDelay });

  const selectSlide = useCallback((index: number) => goTo(index), [goTo]);

  if (count === 0) return null;

  const activeSlide = slides[current];
  const total = String(count).padStart(2, "0");

  const rootStyle = {
    "--dur": `${duration}ms`,
    "--autoplay": `${autoplayDelay}ms`,
  } as CSSProperties;

  return (
    <section
      ref={rootRef}
      className={styles.root}
      style={rootStyle}
      data-dragging={isDragging ? "true" : "false"}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured work"
      tabIndex={0}
      {...pointerHandlers}
    >
      <div className={styles.stage}>
        {slides.map((slide, index) => {
          const { outer, scrim, role } = slideStyles(index, {
            current,
            previous,
            direction,
            phase,
            axis,
            dragOffset,
            isDragging,
            reducedMotion,
          });

          return (
            <div
              key={slide.id}
              className={styles.slide}
              style={outer}
              data-role={role}
              aria-hidden={role === "current" ? undefined : true}
            >
              <Image
                className={styles.image}
                src={slide.image}
                alt={slide.alt}
                fill
                sizes="100vw"
                quality={85}
                priority={index === 0}
                placeholder="blur"
                draggable={false}
                style={{ objectPosition: slide.focus }}
              />
              <span className={styles.slideScrim} style={scrim} aria-hidden="true" />
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

        <BottomNav
          slides={slides}
          current={current}
          timing={autoplayRunning}
          onSelect={selectSlide}
        />
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {`Slide ${current + 1} of ${count}: ${activeSlide.title}`}
      </p>
    </section>
  );
}
