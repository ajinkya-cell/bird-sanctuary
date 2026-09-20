"use client";

import React from "react";
import Image from "next/image";
import { motion, MotionValue, useTransform, useReducedMotion } from "framer-motion";

interface TransitionScene2Props {
  progress: MotionValue<number>;
}

export default function TransitionScene2({ progress }: TransitionScene2Props) {
  const shouldReduceMotion = useReducedMotion();

  // Scroll-driven vertical movement:
  // 1. Rises into viewport as Scene 3 (Sky) exits (0.56 -> 0.62)
  // 2. Holds full-screen view (0.62 -> 0.67)
  // 3. Exits upwards as Scene 4 (Winter) enters (0.67 -> 0.73)
  const y = useTransform(
    progress,
    [0.0, 0.56, 0.62, 0.67, 0.73],
    ["100%", "100%", "0%", "0%", "-100%"]
  );

  const opacity = useTransform(
    progress,
    (p) => (p <= 0.55 || p >= 0.74 ? 0 : 1)
  );

  return (
    <motion.div
      style={{
        y: shouldReduceMotion ? 0 : y,
        opacity,
      }}
      className="absolute inset-0 w-full h-full overflow-hidden select-none z-[25] pointer-events-none will-change-transform"
    >
      <Image
        src="/transition-image2.png"
        alt="Winter Transition Scene"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
        className="object-cover object-center select-none pointer-events-none"
        quality={100}
      />

      {/* Narrative Chapter Card: Winter */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 sm:px-12 md:px-16 pointer-events-none select-none z-10">
        <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl flex flex-col items-center">
          {/* Information Paragraph in EB Garamond (2 lines) */}
          <p
            style={{
              fontFamily: "var(--font-eb-garamond), 'EB Garamond', Georgia, serif",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.85)",
            }}
            className="text-base sm:text-lg md:text-xl lg:text-[22px] text-[#5C7F9F] italic font-normal  text-center"
          >
            <span className="block">
              • During winter, Keoladeo becomes a temporary home for thousands of migratory birds.  Bar-headed Geese, Greylag Geese, 
            </span>
            <span className="block mt-1 sm:mt-1.5">
             • Northern Pintails, Gadwalls, Wigeons, pelicans and many other birds gather in its wetlands to feed, rest and survive the cold months.
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
