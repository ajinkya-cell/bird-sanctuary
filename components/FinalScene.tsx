"use client";

import React from "react";
import Image from "next/image";
import { motion, MotionValue, useTransform, useReducedMotion } from "framer-motion";

interface FinalSceneProps {
  progress: MotionValue<number>;
}

export default function FinalScene({ progress }: FinalSceneProps) {
  const shouldReduceMotion = useReducedMotion();

  // Smooth entrance from 0.90 to 1.0
  const opacity = useTransform(progress, [0.90, 0.96, 1], [0, 1, 1]);
  const logoScale = useTransform(
    progress,
    [0.90, 0.98],
    [shouldReduceMotion ? 1 : 0.94, 1]
  );
  const logoY = useTransform(
    progress,
    [0.90, 0.98],
    [shouldReduceMotion ? 0 : 25, 0]
  );

  const textOpacity = useTransform(progress, [0.93, 0.99], [0, 0.9]);
  const textY = useTransform(
    progress,
    [0.93, 0.99],
    [shouldReduceMotion ? 0 : 18, 0]
  );

  const pointerEvents = useTransform(progress, (p) => (p >= 0.90 ? "auto" : "none"));

  return (
    <motion.div
      style={{
        opacity,
        pointerEvents: pointerEvents as unknown as React.CSSProperties["pointerEvents"],
      }}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#080c10] px-6 select-none z-30"
    >
      {/* Subtle atmospheric glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.3)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        {/* Cinematic Logo Reveal */}
        <motion.div
          style={{
            scale: logoScale,
            y: logoY,
          }}
          className="relative w-64 sm:w-80 md:w-96 aspect-[2.5/1] mb-12 select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
        >
          <Image
            src="/logo.png"
            alt="Nature Story Logo"
            fill
            sizes="(max-width: 768px) 256px, 384px"
            className="object-contain select-none pointer-events-none"
            priority
          />
        </motion.div>

        {/* Restrained, elegant conclusion text */}
        <motion.div
          style={{
            opacity: textOpacity,
            y: textY,
          }}
          className="flex flex-col items-center space-y-3"
        >
          <p className="text-sm md:text-base tracking-[0.25em] uppercase text-zinc-300 font-light font-sans">
            In the quiet cadence of nature
          </p>
          <p className="text-xs md:text-sm tracking-[0.18em] text-zinc-500 font-light font-sans">
            An illustrated visual journey
          </p>
        </motion.div>
      </div>

      {/* Bottom subtle baseline */}
      <div className="absolute bottom-8 text-center text-[11px] tracking-[0.2em] text-zinc-700 uppercase font-mono pointer-events-none">
        End of Journey
      </div>
    </motion.div>
  );
}
