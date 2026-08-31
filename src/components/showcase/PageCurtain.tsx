"use client";

import { useEffect, useRef } from "react";

import styles from "./ScrollPanels.module.css";

export interface PageCurtainProps {
  /** Fill of the sweeping shape — set it to the colour of the page it opens onto. */
  color: string;
  /** Element whose scroll travel drives the sweep. */
  trackRef: React.RefObject<HTMLElement | null>;
  /** Fraction of that travel spent on the page before the sweep starts. */
  delay?: number;
}

/** How far the edge bulges off its diagonal, in viewBox units. */
const BOW = 16;
/** How far ahead the foot of the edge runs — this is what lays it on a slant. */
const TILT = 72;
/**
 * Where each node sits across the bulge, top to bottom. Kept well under the
 * tilt so the edge stays one long diagonal with a soft curl in it, rather than
 * breaking up into a zigzag.
 */
const WOBBLE = [0.45, -0.55, 0.4];

/**
 * The edge lies on a strong diagonal, with a soft curl worked into it by
 * cubics that take vertical tangents at each node. The slant is what makes the
 * shape pour across the frame rather than wipe over it; the curl keeps the
 * boundary from reading as a ruled line.
 */
function curtainPath(progress: number) {
  const p = Math.min(Math.max(progress, 0), 1);
  // Wide enough that every node is clear of the frame at both ends: the foot
  // of the edge runs a full TILT ahead of the head, and both have to clear.
  const base = p * 185 - 80;
  // Lobes are always there, deepest halfway across.
  const swell = 0.55 + 0.45 * Math.sin(Math.PI * p);
  const last = WOBBLE.length - 1;
  const step = 100 / last;

  const at = (i: number) => base + TILT * (i / last) + BOW * WOBBLE[i] * swell;

  let d = `M 0 0 H ${at(0).toFixed(2)}`;
  for (let i = 0; i < last; i += 1) {
    const y = i * step;
    const nextY = (i + 1) * step;
    const pull = step / 3;
    d +=
      ` C ${at(i).toFixed(2)} ${(y + pull).toFixed(2)},` +
      ` ${at(i + 1).toFixed(2)} ${(nextY - pull).toFixed(2)},` +
      ` ${at(i + 1).toFixed(2)} ${nextY.toFixed(2)}`;
  }
  return `${d} H 0 Z`;
}

/**
 * A coloured shape that sweeps across the frame as you scroll off the page,
 * carrying you into the next one. Nothing new appears in between: the shape is
 * the colour of the page you are arriving at, so it simply becomes that page.
 */
export function PageCurtain({ color, trackRef, delay = 0.3 }: PageCurtainProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const track = trackRef.current;
    if (!path || !track) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const box = track.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      const scrolled = travel <= 0 ? 1 : Math.min(Math.max(-box.top / travel, 0), 1);
      // The page holds for a beat before the sweep begins.
      const progress = delay >= 1 ? 0 : (scrolled - delay) / (1 - delay);
      path.setAttribute("d", curtainPath(progress));
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
  }, [trackRef, delay]);

  return (
    <svg
      className={styles.curtain}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path ref={pathRef} fill={color} d={curtainPath(0)} />
    </svg>
  );
}
