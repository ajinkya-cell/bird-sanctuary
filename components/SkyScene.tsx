"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, MotionValue, useTransform, useReducedMotion } from "framer-motion";
import CloudLayer from "./CloudLayer";
import FlyingBirdLayer from "./FlyingBirdLayer";

interface SkySceneProps {
  progress: MotionValue<number>;
}

export default function SkyScene({ progress }: SkySceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isSkyActive, setIsSkyActive] = useState(false);

  useEffect(() => {
    const unsubscribe = progress.on("change", (latest) => {
      if (latest >= 0.70) {
        setIsSkyActive(true);
      }
    });
    return () => unsubscribe();
  }, [progress]);

  // Smooth entrance and exit opacities across extended runway
  const opacity = useTransform(
    progress,
    [0.72, 0.78, 0.90, 0.95],
    [0, 1, 1, 0]
  );

  const skyScale = useTransform(
    progress,
    [0.72, 0.84, 0.95],
    [shouldReduceMotion ? 1 : 1.05, 1, shouldReduceMotion ? 1 : 1.03]
  );

  const pointerEvents = useTransform(progress, (p) =>
    p >= 0.72 && p <= 0.94 ? "auto" : "none"
  );

  return (
    <motion.div
      ref={containerRef}
      style={{
        opacity,
        pointerEvents: pointerEvents as unknown as React.CSSProperties["pointerEvents"],
      }}
      className="absolute inset-0 w-full h-full bg-[#080c10] select-none z-20"
    >
      {/* Sky Background Art */}
      <motion.div
        style={{
          scale: skyScale,
        }}
        className="relative w-full h-full will-change-transform"
      >
        <Image
          src="/new-sky.png"
          alt="Open atmospheric sky"
          fill
          sizes="100vw"
          className="object-cover object-center select-none pointer-events-none"
          quality={95}
        />
      </motion.div>

      {/* Cloud Layers */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <CloudLayer progress={progress} depthFilter="background" />
      </div>
      <div className="absolute inset-0 pointer-events-none z-20">
        <CloudLayer progress={progress} depthFilter="foreground" />
      </div>

      {/* Bird Layers (Unified draggable sticky bird flock on top of all clouds) */}
      <div className="absolute inset-0 pointer-events-none z-35">
        <FlyingBirdLayer isActive={isSkyActive} containerRef={containerRef} />
      </div>

      {/* Atmospheric Edge Vignettes */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#080c10]/60 to-transparent pointer-events-none z-40" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080c10]/60 to-transparent pointer-events-none z-40" />
    </motion.div>
  );
}
