"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Direction = 1 | -1;

/**
 * "arm" parks the incoming slide at its start transform with transitions off,
 * "run" releases it so the browser interpolates to the resting transform.
 */
export type Phase = "idle" | "arm" | "run";

/** Which way the incoming slide travels in. */
export type Axis = "x" | "y";

export interface HeroSliderOptions {
  count: number;
  /** Transition length in ms. */
  duration: number;
  autoplay: boolean;
  autoplayDelay: number;
}

export interface HeroSliderApi {
  current: number;
  previous: number | null;
  direction: Direction;
  phase: Phase;
  /** Alternates every transition, the way the reference does. */
  axis: Axis;
  /** Live horizontal drag in px; 0 unless the pointer is down or just released. */
  dragOffset: number;
  isDragging: boolean;
  reducedMotion: boolean;
  /** True while the autoplay timer is counting down. */
  autoplayRunning: boolean;
  rootRef: React.RefObject<HTMLElement | null>;
  goTo: (index: number, direction?: Direction) => void;
  next: () => void;
  prev: () => void;
  pointerHandlers: {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
  };
}

interface SliderState {
  current: number;
  previous: number | null;
  direction: Direction;
  phase: Phase;
  /** Alternates every transition, the way the reference does. */
  axis: Axis;
}

interface PointerState {
  id: number;
  x: number;
  y: number;
  axis: "x" | "y" | null;
  width: number;
}

const WHEEL_THRESHOLD = 60;
const WHEEL_RESET_MS = 180;
const AXIS_LOCK_PX = 8;

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

export function useHeroSlider({
  count,
  duration,
  autoplay,
  autoplayDelay,
}: HeroSliderOptions): HeroSliderApi {
  const reducedMotion = usePrefersReducedMotion();
  const effectiveDuration = reducedMotion ? 260 : duration;

  const [state, setState] = useState<SliderState>({
    current: 0,
    previous: null,
    direction: 1,
    phase: "idle",
    axis: "x",
  });
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [documentHidden, setDocumentHidden] = useState(false);

  const rootRef = useRef<HTMLElement | null>(null);
  const currentRef = useRef(0);
  const animatingRef = useRef(false);
  const rafRef = useRef(0);
  const releaseRef = useRef(0);
  const settleRef = useRef(0);
  const pointerRef = useRef<PointerState | null>(null);
  /** Seeded to "y" so the first transition comes in horizontally. */
  const axisRef = useRef<Axis>("y");
  const wheelAccumRef = useRef(0);
  const wheelResetRef = useRef(0);

  const goTo = useCallback(
    (index: number, direction?: Direction) => {
      if (count < 2) return;

      const target = ((index % count) + count) % count;
      const from = currentRef.current;
      // One transition at a time. This is what stops a fast wheel flick or a
      // hammered arrow key from stacking half-finished animations.
      if (animatingRef.current || target === from) return;

      const resolved: Direction = direction ?? (target > from ? 1 : -1);
      const axis: Axis = axisRef.current === "x" ? "y" : "x";
      axisRef.current = axis;
      animatingRef.current = true;
      currentRef.current = target;
      setState({ current: target, previous: from, direction: resolved, phase: "arm", axis });

      // Two frames: the first commits the "arm" styles, the second releases
      // them so the transition has a real start value to interpolate from.
      // A backstop timer covers the case where rAF is paused outright, which
      // is what a browser does to a backgrounded tab.
      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        setState((prev) => (prev.phase === "arm" ? { ...prev, phase: "run" } : prev));
        setDragOffset(0);
      };

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(release);
      });

      window.clearTimeout(releaseRef.current);
      releaseRef.current = window.setTimeout(release, 64);

      window.clearTimeout(settleRef.current);
      settleRef.current = window.setTimeout(() => {
        animatingRef.current = false;
        setState((prev) => ({ ...prev, previous: null, phase: "idle" }));
      }, effectiveDuration + 60);
    },
    [count, effectiveDuration],
  );

  const goToRef = useRef(goTo);
  useEffect(() => {
    goToRef.current = goTo;
  }, [goTo]);

  const next = useCallback(() => goToRef.current(currentRef.current + 1, 1), []);
  const prev = useCallback(() => goToRef.current(currentRef.current - 1, -1), []);

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(releaseRef.current);
      window.clearTimeout(settleRef.current);
      window.clearTimeout(wheelResetRef.current);
    },
    [],
  );

  // Wheel / trackpad. Bound natively so it can be non-passive: a full-viewport
  // hero should swallow the gesture rather than let the page scroll under it.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || count < 2) return;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch-zoom
      event.preventDefault();
      if (animatingRef.current) return;

      const delta =
        Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      wheelAccumRef.current += delta;

      window.clearTimeout(wheelResetRef.current);
      wheelResetRef.current = window.setTimeout(() => {
        wheelAccumRef.current = 0;
      }, WHEEL_RESET_MS);

      if (wheelAccumRef.current >= WHEEL_THRESHOLD) {
        wheelAccumRef.current = 0;
        next();
      } else if (wheelAccumRef.current <= -WHEEL_THRESHOLD) {
        wheelAccumRef.current = 0;
        prev();
      }
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [count, next, prev]);

  // Keyboard.
  useEffect(() => {
    if (count < 2) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          prev();
          break;
        case "Home":
          event.preventDefault();
          goToRef.current(0, -1);
          break;
        case "End":
          event.preventDefault();
          goToRef.current(count - 1, 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, next, prev]);

  useEffect(() => {
    const update = () => setDocumentHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const autoplayRunning =
    autoplay && !reducedMotion && count > 1 && !isDragging && !documentHidden;

  const activeIndex = state.current;

  useEffect(() => {
    if (!autoplayRunning) return;
    // Re-armed on every slide change, so the countdown always starts fresh.
    const timer = window.setTimeout(() => next(), autoplayDelay);
    return () => window.clearTimeout(timer);
  }, [autoplayRunning, autoplayDelay, next, activeIndex]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("[data-slider-nodrag]")) return;
    if (animatingRef.current) return;

    const box = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      axis: null,
      width: box.width || 1,
    };
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;

    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;

    if (!pointer.axis) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      pointer.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (pointer.axis === "x") {
        try {
          event.currentTarget.setPointerCapture(pointer.id);
        } catch {
          // The pointer can already be gone (cancelled by the browser, or a
          // synthetic event); the drag still works without capture.
        }
      }
    }

    if (pointer.axis !== "x") return;
    setDragOffset(dx);
  }, []);

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLElement>, commit: boolean) => {
      const pointer = pointerRef.current;
      if (!pointer || pointer.id !== event.pointerId) return;
      pointerRef.current = null;
      setIsDragging(false);

      try {
        if (event.currentTarget.hasPointerCapture(pointer.id)) {
          event.currentTarget.releasePointerCapture(pointer.id);
        }
      } catch {
        // Capture was never taken, or the browser already dropped it.
      }

      const dx = event.clientX - pointer.x;
      const threshold = Math.max(48, Math.min(140, pointer.width * 0.1));

      if (commit && pointer.axis === "x" && Math.abs(dx) >= threshold) {
        // dragOffset is deliberately left in place here: goTo hands it to the
        // outgoing slide during "arm" so the frame carries on from where the
        // finger left it instead of snapping back to centre first.
        const step: Direction = dx < 0 ? 1 : -1;
        goToRef.current(currentRef.current + step, step);
        return;
      }

      setDragOffset(0);
    },
    [],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => endDrag(event, true),
    [endDrag],
  );

  const onPointerCancel = useCallback(
    (event: React.PointerEvent<HTMLElement>) => endDrag(event, false),
    [endDrag],
  );

  return {
    current: state.current,
    previous: state.previous,
    direction: state.direction,
    phase: state.phase,
    axis: state.axis,
    dragOffset,
    isDragging,
    reducedMotion,
    autoplayRunning,
    rootRef,
    goTo,
    next,
    prev,
    pointerHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
