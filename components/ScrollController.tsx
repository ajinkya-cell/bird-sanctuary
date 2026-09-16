"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import HeroScene from "./HeroScene";
import LandscapeReveal from "./LandscapeReveal";
import SkyScene from "./SkyScene";
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

  const updateProgressBy = useCallback((delta: number) => {
    const current = rawProgress.get();
    const next = Math.max(0, Math.min(1, current + delta));
    rawProgress.set(next);
  }, [rawProgress]);

  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Sensitivity factor calibrated for mouse wheel and trackpads
      const delta = (e.deltaY + e.deltaX * 0.5) * 0.00032;
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
        const delta = (diffY + diffX * 0.5) * 0.0009;
        updateProgressBy(delta);

        touchStartY = currentY;
        touchStartX = currentX;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 0.04;
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        updateProgressBy(step);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        updateProgressBy(-step);
      } else if (e.key === "Home") {
        e.preventDefault();
        rawProgress.set(0);
      } else if (e.key === "End") {
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
      {/* Scene 01: Fullscreen Opening Base Image (0.00 -> 0.18) */}
      <HeroScene progress={smoothProgress} />

      {/* Scene 02: Fixed Viewport Landscape Horizontal Pan & Bird Showcase (0.00 -> 0.78) */}
      <LandscapeReveal progress={smoothProgress} />

      {/* Scene 03: Open Sky with Static Clouds & Flight Settling Birds (0.72 -> 0.95) */}
      <SkyScene progress={smoothProgress} />

      {/* Scene 04: Finale Logo & Minimal Typography (0.90 -> 1.00) */}
      <FinalScene progress={smoothProgress} />
    </main>
  );
}
