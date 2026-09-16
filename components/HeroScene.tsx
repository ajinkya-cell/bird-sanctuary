"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, MotionValue, useTransform, useReducedMotion } from "framer-motion";
import ClickCursor from "./ClickCursor";
import WaterRippleCanvas from "./WaterRippleCanvas";

interface HeroSceneProps {
  progress: MotionValue<number>;
}

export default function HeroScene({ progress }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Active from progress 0 to 0.18
  // Natural vertical slide upwards as user scrolls down
  const y = useTransform(progress, [0, 0.18], ["0%", "-100%"]);
  const opacity = useTransform(progress, [0, 0.14, 0.18], [1, 1, 0]);
  const scale = useTransform(progress, [0, 0.18], [1, shouldReduceMotion ? 1 : 0.96]);
  const pointerEvents = useTransform(progress, (p) => (p > 0.15 ? "none" : "auto"));

  return (
    <motion.div
      ref={containerRef}
      style={{
        y: shouldReduceMotion ? 0 : y,
        opacity,
        pointerEvents: pointerEvents as unknown as React.CSSProperties["pointerEvents"],
      }}
      className="absolute inset-0 w-full h-full overflow-hidden bg-[#080c10] cursor-none select-none z-30 will-change-transform"
    >
      {/* Liquid Water Ripple Base Artwork */}
      <motion.div
        style={{
          scale,
        }}
        className="relative w-full h-full will-change-transform overflow-hidden"
      >
        {/* Layer 1: Static Base Front Artwork */}
        <Image
          src="/frontnew.png"
          alt="Opening visual world"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center select-none pointer-events-none"
          quality={100}
        />

        {/* Layer 2: Water Layer Overlay (interactive ripples or static fallback) */}
        {shouldReduceMotion ? (
          <Image
            src="/new-water.png"
            alt="Water surface"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center select-none pointer-events-none"
            quality={100}
          />
        ) : (
          <WaterRippleCanvas
            imageSrc="/new-water.png"
            progress={progress}
            rippleIntensity={0.016}
          />
        )}

        {/* Layer 3: Water Highlight Overlay */}
        <Image
          src="/water-highlight.png"
          alt="Water highlight"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center select-none pointer-events-none"
          quality={100}
        />
      </motion.div>

      {/* Interactive custom cursor & click marks */}
      <ClickCursor containerRef={containerRef} progress={progress} />
    </motion.div>
  );
}
