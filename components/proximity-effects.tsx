"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type MotionState = {
  tx: number;
  ty: number;
  glow: number;
  shadow: number;
  trailX: number;
  trailY: number;
  trailGlow: number;
  targetTx: number;
  targetTy: number;
  targetGlow: number;
  targetShadow: number;
  targetTrailX: number;
  targetTrailY: number;
  targetTrailGlow: number;
  active: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function ProximityEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const supportsInteractiveHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const hasCoarsePointer =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(any-pointer: coarse)").matches;
    const allowsMotion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    if (!allowsMotion) return;

    const usePointerAttraction = supportsInteractiveHover && !hasCoarsePointer;

    let mx = -9999;
    let my = -9999;
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTs = performance.now();
    let raf = 0;
    let lastFrameTs = performance.now();
    let lowFpsFrameCount = 0;
    let effectsDisabledForPerf = false;
    const states = new Map<HTMLElement, MotionState>();

    const getTargets = () => Array.from(document.querySelectorAll<HTMLElement>("[data-proximity]"));

    const getState = (el: HTMLElement) => {
      let state = states.get(el);
      if (!state) {
        state = {
          tx: 0,
          ty: 0,
          glow: 0,
          shadow: 0,
          trailX: 50,
          trailY: 50,
          trailGlow: 0,
          targetTx: 0,
          targetTy: 0,
          targetGlow: 0,
          targetShadow: 0,
          targetTrailX: 50,
          targetTrailY: 50,
          targetTrailGlow: 0,
          active: false,
        };
        states.set(el, state);
      }
      return state;
    };

    const hardResetTarget = (el: HTMLElement) => {
      el.style.setProperty("--tx", "0px");
      el.style.setProperty("--ty", "0px");
      el.style.setProperty("--glow-opacity", "0");
      el.style.setProperty("--shadow-alpha", "0");
      el.style.setProperty("--trail-opacity", "0");
      el.classList.remove("proximity-active");
    };

    const update = () => {
      raf = 0;
      const nowTs = performance.now();
      const frameMs = nowTs - lastFrameTs;
      lastFrameTs = nowTs;

      // Auto-disable effect if runtime FPS remains low (production-safe battery/perf fallback).
      if (frameMs > 1000 / 40) {
        lowFpsFrameCount += 1;
      } else {
        lowFpsFrameCount = Math.max(0, lowFpsFrameCount - 1);
      }

      if (lowFpsFrameCount > 24 && !effectsDisabledForPerf) {
        effectsDisabledForPerf = true;
        for (const el of states.keys()) {
          hardResetTarget(el);
        }
        return;
      }

      if (effectsDisabledForPerf) return;

      let hasActiveMotion = false;
      const targets = getTargets();
      const activeSet = new Set(targets);

      for (const knownEl of states.keys()) {
        if (!activeSet.has(knownEl)) {
          states.delete(knownEl);
        }
      }

      for (const el of targets) {
        const state = getState(el);
        const rect = el.getBoundingClientRect();
        if (usePointerAttraction) {
          const isInside = mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom;

          if (!isInside || mx < 0 || my < 0) {
            state.targetTx = 0;
            state.targetTy = 0;
            state.targetGlow = 0;
            state.targetShadow = 0;
            state.targetTrailGlow = 0;
            state.active = false;
            continue;
          }

          const nx = ((mx - rect.left) / rect.width) * 2 - 1;
          const ny = ((my - rect.top) / rect.height) * 2 - 1;
          const centerDistance = Math.min(1, Math.hypot(nx, ny));
          const strength = 1 - centerDistance * 0.45;
          const parsedStrength = Number.parseFloat(el.dataset.proximityStrength ?? "1");
          const moveStrength = Number.isFinite(parsedStrength) ? parsedStrength : 1;
          const tx = nx * 6 * strength * moveStrength;
          const ty = ny * 6 * strength * moveStrength;
          const localX = clamp(((mx - rect.left) / rect.width) * 100, 0, 100);
          const localY = clamp(((my - rect.top) / rect.height) * 100, 0, 100);

          el.style.setProperty("--mx", `${localX.toFixed(1)}%`);
          el.style.setProperty("--my", `${localY.toFixed(1)}%`);

          state.targetTx = tx;
          state.targetTy = ty;
          state.targetGlow = 0.09 + strength * 0.14;
          state.targetShadow = 0.04 + strength * 0.1;
          state.targetTrailX = localX;
          state.targetTrailY = localY;
          state.targetTrailGlow = (0.2 + strength * 0.28) * Math.min(1.2, moveStrength);
          state.active = true;
          continue;
        }

        // Touch/mobile-friendly fallback: subtle scroll-velocity and viewport-center responsiveness.
        const viewportCenterY = window.innerHeight * 0.5;
        const elementCenterY = rect.top + rect.height * 0.5;
        const proximity = 1 - Math.min(1, Math.abs((elementCenterY - viewportCenterY) / (window.innerHeight * 0.7)));
        const mobileMotionScale = hasCoarsePointer ? 0.72 : 1;
        const impulse = clamp(scrollVelocity * 16, -26, 26);
        const ty = clamp(impulse * 0.2, -9, 9) * (0.35 + proximity * 0.65) * mobileMotionScale;
        const tx = clamp(((elementCenterY - viewportCenterY) / window.innerHeight) * -ty * 0.18, -2.5, 2.5) * mobileMotionScale;

        state.targetTx = tx;
        state.targetTy = ty;
        state.targetGlow = 0;
        state.targetShadow = 0;
        state.targetTrailGlow = 0;
        state.active = Math.abs(tx) > 0.02 || Math.abs(ty) > 0.02;
      }

      for (const el of targets) {
        const state = getState(el);
        const leadSmoothing = state.active ? 0.32 : 0.12;
        const trailSmoothing = state.active ? 0.065 : 0.028;

        state.tx += (state.targetTx - state.tx) * leadSmoothing;
        state.ty += (state.targetTy - state.ty) * leadSmoothing;
        state.glow += (state.targetGlow - state.glow) * leadSmoothing;
        state.shadow += (state.targetShadow - state.shadow) * leadSmoothing;
        state.trailX += (state.targetTrailX - state.trailX) * trailSmoothing;
        state.trailY += (state.targetTrailY - state.trailY) * trailSmoothing;
        state.trailGlow += (state.targetTrailGlow - state.trailGlow) * trailSmoothing;

        el.style.setProperty("--tx", `${state.tx.toFixed(2)}px`);
        el.style.setProperty("--ty", `${state.ty.toFixed(2)}px`);
        el.style.setProperty("--glow-opacity", `${Math.max(0, state.glow).toFixed(2)}`);
        el.style.setProperty("--shadow-alpha", `${Math.max(0, state.shadow).toFixed(2)}`);
        el.style.setProperty("--mx-trail", `${clamp(state.trailX, 0, 100).toFixed(1)}%`);
        el.style.setProperty("--my-trail", `${clamp(state.trailY, 0, 100).toFixed(1)}%`);
        el.style.setProperty("--trail-opacity", `${Math.max(0, state.trailGlow).toFixed(2)}`);

        const resting =
          Math.abs(state.tx) < 0.03 &&
          Math.abs(state.ty) < 0.03 &&
          state.glow < 0.01 &&
          state.shadow < 0.01 &&
          state.trailGlow < 0.01;

        if (!resting) {
          hasActiveMotion = true;
          el.classList.add("proximity-active");
        } else {
          el.classList.remove("proximity-active");
        }
      }

      if (hasActiveMotion) {
        if (!usePointerAttraction) {
          scrollVelocity *= 0.88;
          if (Math.abs(scrollVelocity) < 0.005) {
            scrollVelocity = 0;
          }
        }
        raf = window.requestAnimationFrame(update);
      }
    };

    const queueUpdate = () => {
      if (!raf) {
        raf = window.requestAnimationFrame(update);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!usePointerAttraction) return;
      if (e.pointerType && e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      queueUpdate();
    };

    const onPointerLeave = () => {
      if (!usePointerAttraction) return;
      mx = -9999;
      my = -9999;
      queueUpdate();
    };

    const onScrollOrResize = () => {
      if (!usePointerAttraction) {
        const now = performance.now();
        const dy = window.scrollY - lastScrollY;
        const dt = Math.max(1, now - lastScrollTs);
        const instantVelocity = dy / dt;
        scrollVelocity = scrollVelocity * 0.55 + instantVelocity * 0.45;
        lastScrollY = window.scrollY;
        lastScrollTs = now;
      }
      queueUpdate();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (raf) window.cancelAnimationFrame(raf);
      for (const el of states.keys()) {
        hardResetTarget(el);
      }
    };
  }, [pathname]);

  return null;
}
