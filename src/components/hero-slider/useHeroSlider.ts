"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Direction = 1 | -1;

/** Bands run as vertical columns ("y") or as horizontal rows ("x"). */
export type Axis = "x" | "y";

export interface HeroSliderOptions {
  count: number;
  /** Whole transition length in ms: first band moving to last band landing. */
  duration: number;
  autoplay: boolean;
  autoplayDelay: number;
}

export interface HeroSliderApi {
  /** The slide painted full-frame underneath. */
  current: number;
  /** The slide the bands are carrying in, or null when settled. */
  incoming: number | null;
  /** What the navigation and counters should point at — the target, at once. */
  active: number;
  direction: Direction;
  axis: Axis;
  /** Increments per transition, so the bands remount and restart cleanly. */
  transitionId: number;
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
  incoming: number | null;
  direction: Direction;
  axis: Axis;
  transitionId: number;
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
  const effectiveDuration = reducedMotion ? 280 : duration;

  const [state, setState] = useState<SliderState>({
    current: 0,
    incoming: null,
    direction: 1,
    // Seeded to "x" so the first transition runs as columns from the foot.
    axis: "x",
    transitionId: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [documentHidden, setDocumentHidden] = useState(false);

  const rootRef = useRef<HTMLElement | null>(null);
  const currentRef = useRef(0);
  const animatingRef = useRef(false);
  const axisRef = useRef<Axis>("x");
  const settleRef = useRef(0);
  const pointerRef = useRef<PointerState | null>(null);
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

      setState((prev) => ({
        current: prev.current,
        incoming: target,
        direction: resolved,
        axis,
        transitionId: prev.transitionId + 1,
      }));

      window.clearTimeout(settleRef.current);
      settleRef.current = window.setTimeout(() => {
        animatingRef.current = false;
        currentRef.current = target;
        // The bands already cover the frame with this very slide, so promoting
        // it and dropping them is not visible.
        setState((prev) => ({ ...prev, current: target, incoming: null }));
      }, effectiveDuration + 40);
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
      window.clearTimeout(settleRef.current);
      window.clearTimeout(wheelResetRef.current);
    },
    [],
  );

  // Wheel / trackpad, horizontal only. There is a page below the hero now, so
  // a vertical wheel has to keep scrolling it; sideways gestures are the ones
  // that belong to the slider.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || count < 2) return;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch-zoom
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (animatingRef.current) return;

      wheelAccumRef.current += event.deltaX;

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

  // Keyboard: left and right only. Up/down and Home/End belong to the page now
  // that there is one below the hero, and the keys are ignored altogether once
  // the hero has been scrolled past.
  useEffect(() => {
    if (count < 2) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))
      ) {
        return;
      }

      const box = rootRef.current?.getBoundingClientRect();
      if (!box) return;
      const shown = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
      if (shown < window.innerHeight * 0.5) return;

      event.preventDefault();
      if (event.key === "ArrowRight") next();
      else prev();
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

  const active = state.incoming ?? state.current;

  useEffect(() => {
    if (!autoplayRunning) return;
    // Re-armed on every slide change, so the countdown always starts fresh.
    const timer = window.setTimeout(() => next(), autoplayDelay);
    return () => window.clearTimeout(timer);
  }, [autoplayRunning, autoplayDelay, next, active]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("[data-slider-nodrag]")) return;
    if (animatingRef.current) return;

    pointerRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      axis: null,
      width: event.currentTarget.getBoundingClientRect().width || 1,
    };
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    if (pointer.axis) return;

    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
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
        const step: Direction = dx < 0 ? 1 : -1;
        goToRef.current(currentRef.current + step, step);
      }
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
    incoming: state.incoming,
    active,
    direction: state.direction,
    axis: state.axis,
    transitionId: state.transitionId,
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
