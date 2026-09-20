"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, MotionValue, useTransform, useReducedMotion } from "framer-motion";
import DragonflyFollower from "./DragonflyFollower";

interface FinalSceneProps {
  progress: MotionValue<number>;
}

export default function FinalScene({ progress }: FinalSceneProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isFinalActive, setIsFinalActive] = useState(false);

  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      setIsFinalActive(v >= 0.93);
    });
    return () => unsub();
  }, [progress]);

  // Smooth entrance from 0.93 to 1.0
  const opacity = useTransform(progress, [0.93, 0.97, 1], [0, 1, 1]);
  const logoScale = useTransform(
    progress,
    [0.93, 0.99],
    [shouldReduceMotion ? 1 : 0.94, 1]
  );
  const logoY = useTransform(
    progress,
    [0.93, 0.99],
    [shouldReduceMotion ? 0 : 25, 0]
  );

  const textOpacity = useTransform(progress, [0.95, 0.99], [0, 0.9]);
  const textY = useTransform(
    progress,
    [0.95, 0.99],
    [shouldReduceMotion ? 0 : 18, 0]
  );

  const pointerEvents = useTransform(progress, (p) => (p >= 0.93 ? "auto" : "none"));

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

        {/* Restrained, elegant conclusion invitation */}
        <motion.div
          style={{
            opacity: textOpacity,
            y: textY,
          }}
          className="flex items-center justify-center text-center px-4"
        >
          <p
            style={{
              fontFamily: "var(--font-inter), 'Inter', sans-serif",
            }}
            className="text-base md:text-lg text-zinc-300 font-light tracking-wide inline-flex flex-wrap items-center justify-center gap-x-2"
          >
            <span className="uppercase">Experience nature once again at</span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <span
                style={{
                  fontFamily: "var(--font-cedarville), 'Cedarville Cursive', cursive",
                  textShadow: "0 2px 12px rgba(254, 243, 199, 0.25)",
                }}
                className="text-2xl sm:text-3xl md:text-4xl text-amber-100/95 font-normal tracking-wider"
              >
                Keoladeo
              </span>
              {/* Tilted flower flourish */}
              <span
                className="relative inline-block -translate-x-10 -translate-y-5 w-20 h-20  select-none pointer-events-none origin-bottom-left -mt-1"
                style={{
                  transform: "rotate(18deg)",
                  filter: "drop-shadow(0 2px 8px rgba(244, 114, 182, 0.28))",
                }}
              >
                <Image
                  src="/flower.png"
                  alt="Flower"
                  fill
                  sizes="48px"
                  className="object-contain object-bottom select-none pointer-events-none"
                />
              </span>
            </span>
          </p>
        </motion.div>
      </div>

      {/* Subtle dragonfly cursor follower */}
      <DragonflyFollower active={isFinalActive} />
    </motion.div>
  );
}
