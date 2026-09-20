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
  // 1. Rises into viewport as Scene 1 exits (0.00 -> 0.08)
  // 2. Holds full-screen view (0.08 -> 0.12)
  // 3. Exits upwards as Scene 2 enters (0.12 -> 0.18)
  const y = useTransform(
    progress,
    [0.0, 0.08, 0.12, 0.18],
    ["100%", "0%", "0%", "-100%"]
  );

  const opacity = useTransform(progress, (p) => (p <= 0.0 || p >= 0.18 ? 0 : 1));

  return (
    <motion.div
      style={{
        y: shouldReduceMotion ? 0 : y,
        opacity,
      }}
      className="absolute inset-0 w-full h-full overflow-hidden select-none z-[25] pointer-events-none will-change-transform"
    >
      <Image
        src="/transition-image1.png"
        alt="Transition Scene"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
        className="object-cover object-center select-none pointer-events-none"
        quality={100}
      />

      {/* Narrative Chapter Card: Monsoon */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 sm:px-12 md:px-16 pointer-events-none select-none z-10">
        <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl flex flex-col items-center">
          {/* Information Paragraph in EB Garamond (2 lines) */}
          <p
            style={{
              fontFamily: "var(--font-eb-garamond), 'EB Garamond', Georgia, serif",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.85)",
            }}
            className="text-base sm:text-lg md:text-xl lg:text-[22px] text-[#79833B] italic font-normal    text-center"
          >
            <span className="block">
              • The monsoon brings rain to Keoladeo, filling the wetlands with water. The landscape turns green and food becomes abundant.
            </span>
            <span className="block mt-1 sm:mt-1.5">
              • Resident birds such as Painted Storks, Herons, Egrets and Ibises begin breeding, making the wetland full of nests, chicks and activity.
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
