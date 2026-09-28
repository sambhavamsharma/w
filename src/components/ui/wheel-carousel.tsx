"use client";

import type { StaticImageData } from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export interface WheelCarouselItem {
  label: string;
  image: StaticImageData | string;
  imageAlt?: string;
}

const aspectRatios = {
  "3/4": "3 / 4",
  "1/1": "1 / 1",
  "4/3": "4 / 3",
  "3/2": "3 / 2",
} as const;

export interface WheelCarouselProps {
  items: WheelCarouselItem[];
  /** A fixed palette — there's no light/dark toggle on this site. */
  palette?: {
    background: string;
    text: string;
    selected: string;
    marker: string;
    panel: string;
  };
  photoSide?: "left" | "right";
  photoWidth?: number;
  photoAspect?: keyof typeof aspectRatios;
  contentWidth?: number;
  gap?: number;
  photoRadius?: number;
  crossfadeDuration?: number;
  radius?: number;
  spacing?: number;
  visibleItems?: number;
  apexInset?: number;
  showMarker?: boolean;
  markerSize?: number;
  markerGap?: number;
  scrollSpeed?: number;
  dragSpeed?: number;
  snap?: boolean;
  momentum?: boolean;
  edgeFade?: boolean;
  edgeFadeSize?: number;
  initialIndex?: number;
  activeIndex?: number;
  onActiveChange?: (item: WheelCarouselItem, index: number) => void;
  className?: string;
  photoClassName?: string;
  itemClassName?: string;
}

const DEFAULT_PALETTE = {
  background: "#0a0d0a",
  text: "rgba(255, 255, 255, 0.4)",
  selected: "#ffffff",
  marker: "#ffffff",
  panel: "#181c11",
};

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function shortestOffset(index: number, rotation: number, length: number) {
  let offset = index - rotation;
  while (offset > length / 2) offset -= length;
  while (offset < -length / 2) offset += length;
  return offset;
}

/**
 * A vertical rolodex: labels arc away above and below the selected one while
 * a photo panel crossfades to match. Adapted from a reusable original that
 * supported next-themes light/dark switching — this site has one fixed
 * theme, so that's traded for a plain `palette` prop instead.
 */
export function WheelCarousel({
  items,
  palette = DEFAULT_PALETTE,
  photoSide = "left",
  photoWidth = 42,
  photoAspect = "3/4",
  contentWidth = 900,
  gap = 0,
  photoRadius = 14,
  crossfadeDuration = 0.5,
  radius = 320,
  spacing = 14,
  visibleItems = 7,
  apexInset = 34,
  showMarker = true,
  markerSize = 16,
  markerGap = 20,
  scrollSpeed = 0.008,
  dragSpeed = 0.02,
  snap = true,
  momentum = true,
  edgeFade = true,
  edgeFadeSize = 30,
  initialIndex = 0,
  activeIndex,
  onActiveChange,
  className,
  photoClassName,
  itemClassName,
}: WheelCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const instanceId = useId();
  const itemCount = items.length;
  const startingIndex = wrapIndex(activeIndex ?? initialIndex, itemCount);
  const [rotation, setRotation] = useState(startingIndex);
  const [selectedIndex, setSelectedIndex] = useState(startingIndex);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(startingIndex);
  const selectedRef = useRef(startingIndex);
  const appliedActiveIndexRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const dragOriginRef = useRef({ y: 0, rotation: startingIndex });
  const previousDragRotationRef = useRef(startingIndex);
  const frameRef = useRef<number | null>(null);

  const commitRotation = useCallback(
    (nextRotation: number) => {
      rotationRef.current = nextRotation;
      setRotation(nextRotation);
      const nextIndex = wrapIndex(Math.round(nextRotation), itemCount);
      if (nextIndex !== selectedRef.current) {
        selectedRef.current = nextIndex;
        setSelectedIndex(nextIndex);
        onActiveChange?.(items[nextIndex]!, nextIndex);
      }
    },
    [items, itemCount, onActiveChange],
  );

  const commitRotationRef = useRef(commitRotation);
  useEffect(() => {
    commitRotationRef.current = commitRotation;
  }, [commitRotation]);

  const runAnimation = useCallback(() => {
    if (frameRef.current !== null) return;

    const tick = () => {
      let keepAnimating = false;

      if (!draggingRef.current && Math.abs(velocityRef.current) > 0.0008) {
        commitRotation(rotationRef.current + velocityRef.current);
        velocityRef.current *=
          momentum && !reduceMotion ? (snap ? 0.9 : 0.94) : 0.8;
        keepAnimating = true;
      } else if (!draggingRef.current && snap) {
        velocityRef.current = 0;
        const target = Math.round(rotationRef.current);
        const delta = target - rotationRef.current;
        if (Math.abs(delta) > 0.001 && !reduceMotion) {
          commitRotation(rotationRef.current + delta * 0.22);
          keepAnimating = true;
        } else {
          commitRotation(target);
        }
      } else if (!draggingRef.current) {
        velocityRef.current = 0;
      }

      if (keepAnimating) frameRef.current = requestAnimationFrame(tick);
      else frameRef.current = null;
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [commitRotation, momentum, reduceMotion, snap]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (event: globalThis.WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return; // don't hijack pinch-zoom
      event.preventDefault();
      const delta = event.deltaY * scrollSpeed;
      commitRotation(rotationRef.current + delta);
      velocityRef.current = delta * 0.2;
      runAnimation();
    };

    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, [commitRotation, runAnimation, scrollSpeed]);

  useEffect(() => {
    if (activeIndex === undefined) return;
    const controlledIndex = wrapIndex(activeIndex, itemCount);
    if (appliedActiveIndexRef.current === controlledIndex) return;
    appliedActiveIndexRef.current = controlledIndex;
    const currentIndex = wrapIndex(Math.round(rotationRef.current), itemCount);
    let delta = controlledIndex - currentIndex;
    if (delta > itemCount / 2) delta -= itemCount;
    if (delta < -itemCount / 2) delta += itemCount;
    selectedRef.current = controlledIndex;
    setSelectedIndex(controlledIndex);
    commitRotationRef.current(rotationRef.current + delta);
  }, [activeIndex, itemCount]);

  const moveBy = (amount: number) => {
    velocityRef.current = 0;
    commitRotation(rotationRef.current + amount);
    runAnimation();
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    draggingRef.current = true;
    setIsDragging(true);
    velocityRef.current = 0;
    dragOriginRef.current = { y: event.clientY, rotation: rotationRef.current };
    previousDragRotationRef.current = rotationRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const distance = event.clientY - dragOriginRef.current.y;
    const nextRotation = dragOriginRef.current.rotation - distance * dragSpeed;
    velocityRef.current = nextRotation - previousDragRotationRef.current;
    previousDragRotationRef.current = nextRotation;
    commitRotation(nextRotation);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    runAnimation();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      moveBy(1);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveBy(-1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      velocityRef.current = 0;
      commitRotation(rotationRef.current - selectedIndex);
      runAnimation();
    }
    if (event.key === "End") {
      event.preventDefault();
      velocityRef.current = 0;
      const lastIndex = itemCount - 1;
      commitRotation(rotationRef.current + lastIndex - selectedIndex);
      runAnimation();
    }
  };

  const safeSelectedIndex = wrapIndex(selectedIndex, itemCount);
  const selectedItem = items[safeSelectedIndex]!;
  const selectedSrc =
    typeof selectedItem.image === "string"
      ? selectedItem.image
      : selectedItem.image.src;
  const mask = edgeFade
    ? `linear-gradient(to bottom, transparent 0%, black ${edgeFadeSize}%, black ${100 - edgeFadeSize}%, transparent 100%)`
    : undefined;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex h-full min-h-[420px] w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{ backgroundColor: palette.background }}
    >
      <div
        ref={stageRef}
        role="listbox"
        aria-label="Product picker"
        aria-activedescendant={
          Math.abs(shortestOffset(safeSelectedIndex, rotation, itemCount)) <=
          visibleItems + 1
            ? `${instanceId}-item-${safeSelectedIndex}`
            : undefined
        }
        tabIndex={0}
        className={cn(
          "relative flex h-full w-full touch-none select-none items-stretch overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-current",
          photoSide === "right" && "flex-row-reverse",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ maxWidth: contentWidth, gap }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        <div
          className="flex h-full shrink-0 items-center justify-center"
          style={{
            width: `${photoWidth}%`,
            backgroundColor: palette.background,
          }}
        >
          <div
            className={cn(
              "relative max-h-full w-full overflow-hidden",
              photoClassName,
            )}
            style={{
              aspectRatio: aspectRatios[photoAspect],
              borderRadius: photoRadius,
              backgroundColor: palette.panel,
            }}
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.img
                key={`${safeSelectedIndex}-${selectedSrc}`}
                src={selectedSrc}
                alt={selectedItem.imageAlt ?? selectedItem.label}
                initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : crossfadeDuration }}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Positioned, not a flex sibling: a flex item with only
            absolutely-positioned descendants and no in-flow content can end
            up with a stretched height of 0 in some layouts. Pinning it to
            the listbox's own box with inset/left/right sidesteps that. */}
        <div
          className="absolute inset-y-0 overflow-hidden"
          style={{
            left: photoSide === "left" ? `${photoWidth}%` : 0,
            right: photoSide === "left" ? 0 : `${photoWidth}%`,
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        >
          {showMarker && (
            <span
              aria-hidden="true"
              className="absolute top-1/2 z-10 -translate-y-1/2 rounded-full"
              style={{
                left: `calc(${apexInset}% - ${markerGap}px)`,
                width: markerSize,
                height: markerSize,
                marginLeft: -markerSize,
                backgroundColor: palette.marker,
              }}
            />
          )}

          {items.map((item, index) => {
            const offset = shortestOffset(index, rotation, itemCount);
            if (Math.abs(offset) > visibleItems + 1) return null;

            const angle = offset * spacing;
            const radians = (angle * Math.PI) / 180;
            const x = -radius * (1 - Math.cos(radians));
            const y = radius * Math.sin(radians);
            const distance = Math.min(Math.abs(offset) / visibleItems, 1);
            const opacity = Math.cos((distance * Math.PI) / 2);
            const scale = 1 - Math.min(Math.abs(offset) * 0.04, 0.45);
            const selected = Math.abs(offset) < 0.5;

            return (
              <div
                id={`${instanceId}-item-${index}`}
                key={`${item.label}-${index}`}
                role="option"
                aria-selected={selected}
                className={cn(
                  "pointer-events-none absolute top-1/2 origin-left whitespace-nowrap text-[clamp(1rem,2.4vw,1.625rem)] font-medium leading-none tracking-[-0.01em]",
                  itemClassName,
                )}
                style={{
                  left: `${apexInset}%`,
                  color: selected ? palette.selected : palette.text,
                  opacity,
                  transform: `translate(${x}px, ${y}px) translateY(-50%) rotate(${angle}deg) scale(${scale})`,
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {selectedItem.label}, item {safeSelectedIndex + 1} of {itemCount}
      </span>
    </motion.div>
  );
}
