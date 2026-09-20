"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, MotionValue, useTransform, useReducedMotion, AnimatePresence } from "framer-motion";
import ButterflyFollower from "./ButterflyFollower";

// Panoramic aspect ratio calibrated for winter.png (4055 x 1080 px)
const ASPECT_RATIO = 4055 / 1080;

export interface WinterBirdExhibit {
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

// 4 Winter Birds ordered strictly from left to right: b3 -> b2 -> b4 -> b1
const BIRDS: WinterBirdExhibit[] = [
  {
    id: "b3",
    name: "Bar-headed Goose",
    scientificName: "Anser indicus",
    indexStr: "01 / 04",
    image: "/b3.png",
    info: "A legendary high-altitude migrant capable of soaring over the Himalayan peaks to reach warm wintering waters in India. Distinguished by two iconic black bars across the back of its white head.",
    placement: {
      left: "10.80%",
      top: "78.50%",
      width: "5.75%",
      height: "11.50%",
    },
  },
  {
    id: "b2",
    name: "Great White Pelican",
    scientificName: "Pelecanus onocrotalus",
    indexStr: "02 / 04",
    image: "/b2.png",
    info: "A grand waterbird with pristine white plumage and a prominent pink-yellow expandable throat pouch. Flocks coordinate their swimming in horseshoe formations to herd and scoop up schooling fish.",
    placement: {
      left: "39.80%",
      top: "78.00%",
      width: "4.58%",
      height: "14.50%",
    },
  },
  {
    id: "b4",
    name: "Greylag Goose",
    scientificName: "Anser anser",
    indexStr: "03 / 04",
    image: "/b4.png",
    info: "The largest of the wild grey geese, recognized by its stout orange bill and patterned plumage. Arriving from northern breeding grounds, it grazes peacefully along lake margins and shallow wetlands.",
    placement: {
      left: "65.50%",
      top: "70.80%",
      width: "4.75%",
      height: "10.00%",
    },
  },
  {
    id: "b1",
    name: "Dalmatian Pelican",
    scientificName: "Pelecanus crispus",
    indexStr: "04 / 04",
    image: "/b1.png",
    info: "One of the heaviest flying birds on Earth, renowned for its curly nape feathers and silvery-white feathers. It winters quietly along open freshwater lakes, lagoons, and quiet river mouths.",
    placement: {
      left: "82.20%",
      top: "77.20%",
      width: "5.82%",
      height: "16.00%",
    },
  },
];

interface WinterSceneProps {
  progress: MotionValue<number>;
}

export default function WinterScene({ progress }: WinterSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const [maxScrollX, setMaxScrollX] = useState<number>(0);
  const [renderedWidth, setRenderedWidth] = useState<number>(0);
  const [hoveredBird, setHoveredBird] = useState<WinterBirdExhibit | null>(null);
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

  // Track if scene is currently visible in viewport to show/hide top-left overlay
  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      setIsSceneActive(v >= 0.70 && v <= 0.94);
    });
    return () => unsub();
  }, [progress]);

  // Scene 4 vertical entrance & exit:
  // Enters in lockstep with TransitionScene2 (0.67 -> 0.73), pinned during pan (0.73 -> 0.92), then slight exit drift (0.92 -> 0.96)
  const y = useTransform(
    progress,
    [0, 0.67, 0.73, 0.92, 0.96],
    ["100%", "100%", "0%", "0%", "-8%"]
  );

  // Horizontal pan:
  // Smoothly translates across the panoramic winter wetland as user scrolls
  const x = useTransform(
    progress,
    [0, 0.73, 0.92, 1],
    [0, 0, -maxScrollX, -maxScrollX]
  );

  // Overall scene opacity: visible from 0.67 to 0.96
  const opacity = useTransform(
    progress,
    [0.669, 0.67, 0.92, 0.96],
    [0, 1, 1, 0]
  );

  const pointerEvents = useTransform(progress, (p) =>
    p >= 0.70 && p <= 0.94 ? "auto" : "none"
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
        {/* Panoramic Winter Landscape Image */}
        <div className="relative w-full h-full">
          <Image
            src="/winter.png"
            alt="Panoramic winter wetland landscape"
            fill
            priority
            sizes="(max-width: 768px) 300vw, 400vw"
            className="object-cover object-left h-full w-full select-none pointer-events-none"
            quality={95}
          />

          {/* Placed Interactive Winter Birds Anchored Directly on the Landscape */}
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
                        ? "filter drop-shadow-[0_8px_20px_rgba(255,255,255,0.45)] brightness-110"
                        : "filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_6px_16px_rgba(255,255,255,0.25)]"
                    }`}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Top-Left Bird Information (Frameless Typography matching Scene 2) */}
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
                  {/* Bird Name in Cedarville Cursive */}
                  <h3
                    style={{
                      fontFamily: "var(--font-cedarville), 'Cedarville Cursive', cursive",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.22)",
                    }}
                    className="text-3xl sm:text-4xl md:text-5xl text-black font-normal tracking-wide mb-1.5 text-left"
                  >
                    {hoveredBird.name}
                  </h3>

                  {/* Bird Information in Inter */}
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
