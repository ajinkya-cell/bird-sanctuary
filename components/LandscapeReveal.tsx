"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, MotionValue, useTransform, useReducedMotion } from "framer-motion";

const IMAGE_NATIVE_WIDTH = 4055;
const IMAGE_NATIVE_HEIGHT = 1080;
const ASPECT_RATIO = IMAGE_NATIVE_WIDTH / IMAGE_NATIVE_HEIGHT; // ~3.7546

interface BirdExhibit {
  id: string;
  name: string;
  image: string;
  info: string;
}

const BIRDS: BirdExhibit[] = [
  {
    id: "l1",
    name: "Heron",
    image: "/L1.png",
    info: "A long-legged waterbird that patiently hunts fish and other small animals in shallow water.",
  },
  {
    id: "l2",
    name: "Painted Stork",
    image: "/L2.png",
    info: "A tall, colourful waterbird that feeds in shallow wetlands and builds large nesting colonies.",
  },
  {
    id: "l3",
    name: "Ibis",
    image: "/L3.png",
    info: "A long-billed bird that searches through mud and shallow water for insects and small aquatic animals.",
  },
  {
    id: "l4",
    name: "Egret",
    image: "/L4.png",
    info: "A graceful white waterbird often seen wading through wetlands in search of fish and insects.",
  },
];

interface LandscapeRevealProps {
  progress: MotionValue<number>;
}

export default function LandscapeReveal({ progress }: LandscapeRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const [maxScrollX, setMaxScrollX] = useState<number>(0);
  const [renderedWidth, setRenderedWidth] = useState<number>(0);

  const calculateBounds = useCallback(() => {
    if (typeof window === "undefined") return;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Viewport height is always 100vh
    const totalImageWidth = vh * ASPECT_RATIO;
    const overflow = Math.max(0, totalImageWidth - vw);

    setRenderedWidth(totalImageWidth);
    setMaxScrollX(overflow);
  }, []);

  useEffect(() => {
    calculateBounds();

    const handleResize = () => {
      calculateBounds();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateBounds]);

  // Scene 2 vertical entrance & exit:
  // Rises into position from 0.00 to 0.18, stays pinned until 0.72, then slight upward drift
  const y = useTransform(
    progress,
    [0, 0.18, 0.72, 0.78],
    ["100%", "0%", "0%", "-8%"]
  );

  // Horizontal pan:
  // 1. [0.18 -> 0.30]: Pan from start (0) to middle-left (-0.38 * maxScrollX)
  // 2. [0.30 -> 0.58]: Continuous slow drift across middle (-0.38 * maxScrollX -> -0.62 * maxScrollX)
  // 3. [0.58 -> 0.72]: Resume pan from -0.62 * maxScrollX to end (-maxScrollX)
  const x = useTransform(
    progress,
    [0, 0.18, 0.30, 0.58, 0.72, 1],
    [0, 0, -maxScrollX * 0.38, -maxScrollX * 0.62, -maxScrollX, -maxScrollX]
  );

  // Subtle soft-focus blur & light dimming during the middle bird showcase
  const blurOverlayOpacity = useTransform(
    progress,
    [0.29, 0.32, 0.56, 0.59],
    [0, 1, 1, 0]
  );

  // Overall showcase container animation
  const showcaseOpacity = useTransform(
    progress,
    [0.30, 0.33, 0.56, 0.59],
    [0, 1, 1, 0]
  );

  const showcaseY = useTransform(
    progress,
    [0.30, 0.33, 0.56, 0.59],
    [shouldReduceMotion ? 0 : 25, 0, 0, shouldReduceMotion ? 0 : 20]
  );

  // Individual Bird Crossfades in sequence:
  // Bird 1: Heron (0.32 -> 0.38)
  const bird1Opacity = useTransform(progress, [0.31, 0.33, 0.375, 0.395], [0, 1, 1, 0]);
  const bird1Y = useTransform(
    progress,
    [0.31, 0.33, 0.375, 0.395],
    [shouldReduceMotion ? 0 : 16, 0, 0, shouldReduceMotion ? 0 : -16]
  );

  // Bird 2: Painted Stork (0.39 -> 0.44)
  const bird2Opacity = useTransform(progress, [0.38, 0.40, 0.44, 0.46], [0, 1, 1, 0]);
  const bird2Y = useTransform(
    progress,
    [0.38, 0.40, 0.44, 0.46],
    [shouldReduceMotion ? 0 : 16, 0, 0, shouldReduceMotion ? 0 : -16]
  );

  // Bird 3: Ibis (0.45 -> 0.50)
  const bird3Opacity = useTransform(progress, [0.445, 0.465, 0.505, 0.525], [0, 1, 1, 0]);
  const bird3Y = useTransform(
    progress,
    [0.445, 0.465, 0.505, 0.525],
    [shouldReduceMotion ? 0 : 16, 0, 0, shouldReduceMotion ? 0 : -16]
  );

  // Bird 4: Egret (0.51 -> 0.56)
  const bird4Opacity = useTransform(progress, [0.51, 0.53, 0.56, 0.58], [0, 1, 1, 0]);
  const bird4Y = useTransform(
    progress,
    [0.51, 0.53, 0.56, 0.58],
    [shouldReduceMotion ? 0 : 16, 0, 0, shouldReduceMotion ? 0 : -16]
  );

  const birdMotions = [
    { opacity: bird1Opacity, y: bird1Y },
    { opacity: bird2Opacity, y: bird2Y },
    { opacity: bird3Opacity, y: bird3Y },
    { opacity: bird4Opacity, y: bird4Y },
  ];

  // Overall scene opacity: visible from 0.00 to 0.78
  const opacity = useTransform(
    progress,
    [0, 0.02, 0.72, 0.78],
    [1, 1, 1, 0]
  );

  const pointerEvents = useTransform(progress, (p) =>
    p >= 0.08 && p <= 0.76 ? "auto" : "none"
  );

  return (
    <motion.div
      ref={containerRef}
      style={{
        y: shouldReduceMotion ? 0 : y,
        opacity,
        pointerEvents: pointerEvents as unknown as React.CSSProperties["pointerEvents"],
      }}
      className="absolute inset-0 w-full h-full overflow-hidden flex items-center bg-[#080c10] select-none z-20 will-change-transform"
    >
      {/* Horizontally Translating Panoramic Canvas */}
      <motion.div
        style={{
          x: shouldReduceMotion ? 0 : x,
          width: renderedWidth > 0 ? `${renderedWidth}px` : "375vh",
          height: "100vh",
          willChange: "transform",
        }}
        className="relative h-full flex-shrink-0 flex items-center select-none"
      >
        {/* Panoramic Landscape Image */}
        <div className="relative w-full h-full">
          <Image
            src="/longbig.png"
            alt="Panoramic horizontal landscape"
            fill
            priority
            sizes="(max-width: 768px) 300vw, 400vw"
            className="object-cover object-left h-full w-full select-none pointer-events-none"
            quality={90}
          />
        </div>
      </motion.div>

      {/* Gentle Atmospheric Soft Blur Overlay (Gentle 3px depth-of-field) */}
      <motion.div
        style={{
          opacity: blurOverlayOpacity,
        }}
        className="absolute inset-0 backdrop-blur-[3px] bg-black/20 pointer-events-none z-25 transition-opacity duration-200"
      />

      {/* Floating Bird Showcase Overlay (Directly on screen, no card shells) */}
      <motion.div
        style={{
          opacity: showcaseOpacity,
          y: showcaseY,
        }}
        className="absolute bottom-6 sm:bottom-10 md:bottom-14 left-4 right-4 sm:left-8 sm:right-8 md:left-16 md:right-16 max-w-6xl mx-auto h-[48vh] sm:h-[42vh] md:h-[44vh] min-h-[290px] max-h-[460px] z-30 pointer-events-none select-none"
      >
        <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-14 w-full h-full items-center">
          {/* Left: Floating Bird Cutout Image (No Card Box) */}
          <div className="relative w-full h-full flex items-center justify-center">
            {BIRDS.map((bird, idx) => (
              <motion.div
                key={`img-${bird.id}`}
                style={{
                  opacity: birdMotions[idx].opacity,
                  y: birdMotions[idx].y,
                }}
                className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
              >
                <div className="relative w-full h-full max-w-[240px] max-h-[240px] sm:max-w-[320px] sm:max-h-[320px] md:max-w-[420px] md:max-h-[420px]">
                  <Image
                    src={bird.image}
                    alt={bird.name}
                    fill
                    sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 420px"
                    className="object-contain filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.65)]"
                    priority={idx === 0}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Floating Bird Information (No Card Box) */}
          <div className="relative w-full h-full flex flex-col justify-center">
            {BIRDS.map((bird, idx) => (
              <motion.div
                key={`info-${bird.id}`}
                style={{
                  opacity: birdMotions[idx].opacity,
                  y: birdMotions[idx].y,
                }}
                className="absolute inset-0 flex flex-col justify-center select-none"
              >
                <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#d6cdb8]/75 mb-1.5 sm:mb-2 md:mb-3 font-mono drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                  0{idx + 1} / 04
                </span>
                <h3 className="font-[family-name:var(--font-alegreya)] italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#f6f1e8] tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                  {bird.name}
                </h3>
                <p className="font-[family-name:var(--font-alegreya)] text-sm sm:text-base md:text-xl lg:text-2xl text-[#ded8ca] leading-relaxed mt-2 sm:mt-3 md:mt-5 max-w-xl line-clamp-4 sm:line-clamp-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                  {bird.info}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Soft edge vignettes */}
      <div className="absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-[#080c10]/40 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-[#080c10]/40 to-transparent pointer-events-none z-20" />
    </motion.div>
  );
}
