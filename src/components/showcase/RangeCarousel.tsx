"use client";

import { useEffect, useState } from "react";

import { PerspectiveCarousel } from "@/components/ui/perspective-carousel";
import type { PerspectiveCarouselItem } from "@/components/ui/perspective-carousel";

export interface RangeCarouselProps {
  items: PerspectiveCarouselItem[];
}

/**
 * The carousel as it sits on the Range panel.
 *
 * On a phone the desktop geometry pushes the neighbouring cards clean off the
 * screen, so there is nothing to suggest the carousel goes anywhere. Narrowing
 * the slide and easing the rotation brings the next card back into view as a
 * peek. Desktop keeps the original numbers.
 *
 * The chevron-and-dots pill is off: the peeking cards are the affordance, and
 * each card is a button, so tapping one brings it forward. Arrow keys work too.
 */
export function RangeCarousel({ items }: RangeCarouselProps) {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 47.99em)");
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <PerspectiveCarousel
      items={items}
      loop
      slideWidth={isPhone ? 186 : 230}
      rotationStep={isPhone ? 48 : 60}
      inactiveScale={isPhone ? 0.82 : 0.85}
      showControls={false}
      labelClassName="text-white/85 uppercase tracking-[0.22em] text-[0.625rem]"
    />
  );
}
