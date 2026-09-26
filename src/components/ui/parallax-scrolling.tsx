"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import styles from "./parallax-scrolling.module.css";

export interface ParallaxLayer {
  /** Matches the `data-parallax-layer` attribute on an element in the header. */
  layer: string;
  /**
   * How far the layer is pushed down over the scroll, as a share of its own
   * height. Positive holds it back; negative sends it up faster than the page.
   */
  yPercent: number;
  /** A gentler push for phones, where the layers have far less room to travel. */
  phoneYPercent?: number;
  /** Skipped on phones, where the layer is laid out as a full-bleed backdrop. */
  desktopOnly?: boolean;
}

/**
 * Layer 1 is the bottle and layer 2 the text block. The bottle is sent up
 * faster than the page while the text hangs back, so the product seems to
 * lift out of the frame as the copy is left behind. The nav row carries no
 * layer on purpose: it stays a plain element, so the menu button keeps rising
 * above the slide-in sheet.
 */
const DEFAULT_LAYERS: ParallaxLayer[] = [
  { layer: "1", yPercent: -30, phoneYPercent: -14 },
  { layer: "2", yPercent: 90, phoneYPercent: 40 },
];

export interface ParallaxComponentProps {
  /** The header — anything inside it marked `data-parallax-layer` is tweened. */
  children: ReactNode;
  layers?: ParallaxLayer[];
  /** Small label above the statement in the panel that follows. */
  eyebrow?: string;
  /** The sentence the panel that follows is built around. */
  statement?: string;
}

export function ParallaxComponent({
  children,
  layers = DEFAULT_LAYERS,
  eyebrow,
  statement,
}: ParallaxComponentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const header = headerRef.current;
    if (!root || !header) return;

    // Reduced motion gets the composed frame and the browser's own scrolling.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // Scoped to this component, so tearing it down reverts only its own
    // tweens and triggers rather than every ScrollTrigger on the page.
    const media = gsap.matchMedia(root);

    // matchMedia only runs the callback when a named condition matches, so the
    // phone width needs its own entry or nothing would run below 769px.
    media.add(
      { desktop: "(min-width: 769px)", phone: "(max-width: 768px)" },
      (context) => {
        const { desktop } = context.conditions as { desktop: boolean };

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: header,
            start: "0% 0%",
            end: "100% 0%",
            scrub: 0,
          },
        });

        // The blend between the two sections rises out of the panel below as the
        // scroll goes on: it starts sunk out of sight (the panel covers it) and
        // climbs over the hero's foot, so the purple thins into black gradually
        // instead of the dark arriving all at once. The short fade fixed to the
        // hero's foot covers the raw edge in the first few pixels. Layer tweens
        // default to 0.5s, so the timeline is 0.5 long: 0.22 here means the
        // cloud is fully in place well before the scroll is half done.
        const cloud = header.querySelector("[data-parallax-cloud]");
        if (cloud) {
          timeline.fromTo(
            cloud,
            { yPercent: 100, opacity: 1 },
            { yPercent: 0, opacity: 1, ease: "sine.inOut", duration: 0.22 },
            0,
          );
        }

        layers
          .filter(({ desktopOnly }) => desktop || !desktopOnly)
          .forEach(({ layer, yPercent, phoneYPercent }, index) => {
            timeline.to(
              header.querySelectorAll(`[data-parallax-layer="${layer}"]`),
              {
                yPercent: desktop ? yPercent : (phoneYPercent ?? yPercent),
                ease: "none",
              },
              index === 0 ? 0 : "<",
            );
          });
      },
    );

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // The nav sheet locks scrolling with a body class; Lenis drives the
    // scroll itself, so it has to be told to hold still as well.
    const syncLock = () => {
      if (document.body.classList.contains("nav-open")) lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      media.revert();
    };
  }, [layers]);

  return (
    <div className={styles.parallax} ref={rootRef}>
      <div className={styles.header} ref={headerRef}>
        {children}
        <div data-parallax-cloud className={styles.cloud} aria-hidden="true" />
      </div>

      <section className={styles.content}>
        <div className={styles.contentInner}>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          {statement ? <p className={styles.statement}>{statement}</p> : null}
        </div>
      </section>
    </div>
  );
}
