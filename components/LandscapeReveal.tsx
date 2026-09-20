"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, MotionValue, useTransform, useReducedMotion } from "framer-motion";
import ButterflyFollower from "./ButterflyFollower";

const IMAGE_NATIVE_WIDTH = 4055;
const IMAGE_NATIVE_HEIGHT = 1080;
const ASPECT_RATIO = IMAGE_NATIVE_WIDTH / IMAGE_NATIVE_HEIGHT; // ~3.7546

interface BirdExhibit {
  id: string;
  name: string;
  scientificName: string;
  indexStr: string;
  image: string;
  info: string;
  placement: {
    left: string;
    top: string;
    width: string;
    height: string;
  };
}

// 4 Birds ordered strictly from left to right: L4 -> L1 -> L3 -> L2
const BIRDS: BirdExhibit[] = [
  {
    id: "l4",
    name: "Eurasian Spoonbill",
    scientificName: "Platalea leucorodia",
    indexStr: "01 / 04",
    image: "/L4.png",
    info: "A graceful white wading bird known for its flat, spatulate bill. It sweeps side-to-side through shallow marsh pools to catch small fish and aquatic insects.",
    placement: {
      left: "9.25%",
      top: "67.50%",
      width: "3.67%",
      height: "13.61%",
    },
  },
  {
    id: "l1",
    name: "Grey Heron",
    scientificName: "Ardea cinerea",
    indexStr: "02 / 04",
    image: "/L1.png",
    info: "A tall, statuesque waterbird standing patiently along the water's edge, poised to strike with pinpoint accuracy at passing fish and amphibians.",
    placement: {
      left: "34.15%",
      top: "78.33%",
      width: "3.72%",
      height: "16.48%",
    },
  },
  {
    id: "l3",
    name: "Glossy Ibis",
    scientificName: "Plegadis falcinellus",
    indexStr: "03 / 04",
    image: "/L3.png",
    info: "A slender, down-curved billed forager that probes submerged soil and muddy shallows under the trees for mollusks, insects, and small crustaceans.",
    placement: {
      left: "52.53%",
      top: "81.02%",
      width: "3.58%",
      height: "9.17%",
    },
  },
  {
    id: "l2",
    name: "Painted Stork",
    scientificName: "Mycteria leucocephala",
    indexStr: "04 / 04",
    image: "/L2.png",
    info: "A magnificent wading bird with delicate pink wing feathers and a heavy down-turned yellow beak, foraging in lush flooded wetland marshes.",
    placement: {
      left: "71.34%",
      top: "72.78%",
      width: "4.54%",
      height: "12.32%",
    },
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
  const [hoveredBird, setHoveredBird] = useState<BirdExhibit | null>(null);
  const [isSceneActive, setIsSceneActive] = useState<boolean>(false);

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

  // Track if scene is currently visible in viewport to show/hide top-middle overlay
  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      setIsSceneActive(v >= 0.16 && v <= 0.46);
    });
    return () => unsub();
  }, [progress]);

  // Scene 2 vertical entrance & exit:
  // Rises into position from 0.12 to 0.18, stays pinned until 0.44, then slight upward drift
  const y = useTransform(
    progress,
    [0, 0.12, 0.18, 0.44, 0.48],
    ["100%", "100%", "0%", "0%", "-8%"]
  );

  // Horizontal pan:
  // Smoothly and continuously translates across the panoramic wetland as user scrolls
  const x = useTransform(
    progress,
    [0, 0.18, 0.44, 1],
    [0, 0, -maxScrollX, -maxScrollX]
  );

  // Overall scene opacity: visible from 0.12 to 0.48
  const opacity = useTransform(
    progress,
    [0.119, 0.12, 0.44, 0.48],
    [0, 1, 1, 0]
  );

  const pointerEvents = useTransform(progress, (p) =>
    p >= 0.16 && p <= 0.46 ? "auto" : "none"
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

          {/* Placed Interactive Birds Anchored Directly on the Landscape */}
          {BIRDS.map((bird) => {
            const isHovered = hoveredBird?.id === bird.id;
            return (
              <motion.button
                key={bird.id}
                type="button"
                aria-label={`Inspect ${bird.name}`}
                style={{
                  left: bird.placement.left,
                  top: bird.placement.top,
                  width: bird.placement.width,
                  height: bird.placement.height,
                }}
                className="absolute cursor-pointer select-none focus:outline-none z-20 group"
                onMouseEnter={() => setHoveredBird(bird)}
                onMouseLeave={() => setHoveredBird(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredBird((prev) => (prev?.id === bird.id ? null : bird));
                }}
                whileHover={{ scale: 1.10 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              >
                {/* Subtle visual pulse ring to signal interactivity */}
                <div className="absolute inset-0 -m-2 rounded-full border border-[#d4af37]/0 group-hover:border-[#d4af37]/40 transition-colors duration-300 pointer-events-none" />

                <div className="relative w-full h-full">
                  <Image
                    src={bird.image}
                    alt={bird.name}
                    fill
                    sizes="(max-width: 768px) 150px, 240px"
                    className={`object-contain select-none pointer-events-none transition-all duration-300 ${
                      isHovered
                        ? "filter drop-shadow-[0_8px_20px_rgba(255,255,255,0.4)] brightness-110"
                        : "filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_6px_16px_rgba(255,255,255,0.25)]"
                    }`}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Top-Left Bird Information (Frameless Typography) */}
      <AnimatePresence>
        {isSceneActive && (
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-6 sm:top-8 md:top-10 left-6 sm:left-10 md:left-14 z-40 w-[90vw] max-w-md md:max-w-lg pointer-events-none flex flex-col items-start text-left"
          >
            <AnimatePresence mode="wait">
              {hoveredBird ? (
                <motion.div
                  key={hoveredBird.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="pointer-events-auto flex flex-col items-start text-left select-none"
                >
                  {/* Bird Name in Cedarville Cursive (Black with subtle black text shadow) */}
                  <h3
                    style={{
                      fontFamily: "var(--font-cedarville), 'Cedarville Cursive', cursive",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.22)",
                    }}
                    className="text-3xl sm:text-4xl md:text-5xl text-black font-normal tracking-wide mb-1.5 text-left"
                  >
                    {hoveredBird.name}
                  </h3>

                  {/* Bird Information in Inter (Charcoal/Black with subtle black text shadow) */}
                  <p
                    style={{
                      fontFamily: "var(--font-inter), 'Inter', sans-serif",
                      textShadow: "0 1px 1px rgba(0, 0, 0, 0.15)",
                    }}
                    className="text-xs sm:text-sm md:text-[15px] font-normal text-zinc-900 leading-relaxed max-w-md text-left"
                  >
                    {hoveredBird.info}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="cue-banner"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 0.85, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontFamily: "var(--font-inter), 'Inter', sans-serif",
                    textShadow: "0 1px 1px rgba(0, 0, 0, 0.15)",
                  }}
                  className="inline-flex items-center gap-2 text-xs font-normal text-zinc-800 text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#808C4C] animate-pulse" />
                  <span>Hover over any bird to explore</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated butterfly cursor follower */}
      <ButterflyFollower active={isSceneActive} />
    </motion.div>
  );
}
