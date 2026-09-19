"use client";

import React from "react";
import Image from "next/image";
import { motion, MotionValue, useTransform, useReducedMotion } from "framer-motion";

interface TransitionSceneProps {
  progress: MotionValue<number>;
}

export default function TransitionScene({ progress }: TransitionSceneProps) {
  const shouldReduceMotion = useReducedMotion();

  // Scroll-driven vertical movement:
  // 1. Rises into viewport as Scene 1 exits (0.00 -> 0.12)
  // 2. Holds full-screen view (0.12 -> 0.18)
  // 3. Exits upwards as Scene 2 enters (0.18 -> 0.30)
  const y = useTransform(
    progress,
    [0.0, 0.12, 0.18, 0.30],
    ["100%", "0%", "0%", "-100%"]
  );

  const opacity = useTransform(progress, (p) => (p <= 0.0 || p >= 0.30 ? 0 : 1));

  return (
    <motion.div
      style={{
        y: shouldReduceMotion ? 0 : y,
        opacity,
      }}
      className="absolute inset-0 w-full h-full overflow-hidden select-none z-[25] pointer-events-none will-change-transform"
    >
      <Image
        src="/transition-landscape.png"
        alt="Transition"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
        className="object-cover object-center select-none pointer-events-none"
        quality={100}
      />
    </motion.div>
  );
}
