"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import HeroScene from "./HeroScene";
import TransitionScene from "./TransitionScene";
import LandscapeReveal from "./LandscapeReveal";
import SkyScene from "./SkyScene";
import WinterScene from "./WinterScene";
import TransitionScene2 from "./TransitionScene2";
import FinalScene from "./FinalScene";

export default function ScrollController() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw target timeline progress from 0.0 to 1.0
  const rawProgress = useMotionValue(0);

  // Smooth damped spring for organic fluid motion
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 85,
    damping: 24,
    mass: 0.4,
  });

  // Track flight state: isBirdFlying locks scroll; isBirdComplete allows moving to next page
  const isBirdFlyingRef = useRef(false);
  const isBirdCompleteRef = useRef(false);

  const handleBirdFlightStateChange = useCallback((isFlying: boolean, isComplete: boolean) => {
    isBirdFlyingRef.current = isFlying;
    if (isComplete) {
      isBirdCompleteRef.current = true;
    }
    if (!isFlying && !isComplete) {
      isBirdCompleteRef.current = false;
    }
  }, []);

  const updateProgressBy = useCallback((delta: number) => {
    const current = rawProgress.get();

    // 1. While birds are actively flying, lock scrolling
    if (isBirdFlyingRef.current) {
      return;
    }

    // 2. Until birds finish flying, do not allow scrolling forward past Scene 3 (0.50)
    if (!isBirdCompleteRef.current && delta > 0) {
      if (current < 0.50 && current + delta >= 0.50) {
        rawProgress.set(0.50);
        return;
      }
      if (current >= 0.50) {
        return;
      }
    }

    const next = Math.max(0, Math.min(1, current + delta));

    // If user scrolled back up before Scene 3, reset completion for replay
    if (next < 0.44) {
      isBirdCompleteRef.current = false;
    }

    rawProgress.set(next);
  }, [rawProgress]);

  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Sensitivity factor calibrated for 5 rich scenes (two panoramic landscapes)
      const delta = (e.deltaY + e.deltaX * 0.5) * 0.00026;
      updateProgressBy(delta);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;

        const diffY = touchStartY - currentY;
        const diffX = touchStartX - currentX;

        // Use dominant direction or combined delta
        const delta = (diffY + diffX * 0.5) * 0.0008;
        updateProgressBy(delta);

        touchStartY = currentY;
        touchStartX = currentX;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 0.035;
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        updateProgressBy(step);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        updateProgressBy(-step);
      } else if (e.key === "Home") {
        if (isBirdFlyingRef.current) return;
        e.preventDefault();
        rawProgress.set(0);
        isBirdCompleteRef.current = false;
      } else if (e.key === "End") {
        if (isBirdFlyingRef.current) return;
        if (!isBirdCompleteRef.current) {
          e.preventDefault();
          rawProgress.set(0.50);
          return;
        }
        e.preventDefault();
        rawProgress.set(1);
      }
    };

    const target = containerRef.current || window;

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [updateProgressBy, rawProgress]);

  return (
    <main
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#080c10] text-[#e4e7eb] select-none touch-none"
    >
      {/* Scene 01: Fullscreen Opening Base Image (0.00 -> 0.08) */}
      <HeroScene progress={smoothProgress} />

      {/* Intermediate Transition Image (0.00 -> 0.18) */}
      <TransitionScene progress={smoothProgress} />

      {/* Scene 02: Fixed Viewport Landscape Horizontal Pan & Bird Showcase (0.12 -> 0.48) */}
      <LandscapeReveal progress={smoothProgress} />

      {/* Scene 03: Open Sky with Static Clouds & Flight Settling Birds (0.42 -> 0.62) */}
      <SkyScene
        progress={smoothProgress}
        onBirdFlightStateChange={handleBirdFlightStateChange}
      />

      {/* Transition Scene 02: Winter Sky / Frost Transition Image (0.56 -> 0.73) */}
      <TransitionScene2 progress={smoothProgress} />

      {/* Scene 04: Panoramic Winter Wetland & Bird Showcase (0.67 -> 0.96) */}
      <WinterScene progress={smoothProgress} />

      {/* Scene 05: Finale Logo & Minimal Typography (0.91 -> 1.00) */}
      <FinalScene progress={smoothProgress} />
    </main>
  );
}
