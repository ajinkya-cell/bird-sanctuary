"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface InteractiveBirdConfig {
  id: string;
  name: string;
  perchedSrc: string;
  flyingSrc: string;
  xPercent: number;
  yPercent: number;
  sizePx: number;
  perchRotation: number;
  flyDeltaX: number; // in pixels or relative units
  flyDeltaY: number;
  flyRotation: number;
  duration: number;
}

const INTERACTIVE_BIRDS: InteractiveBirdConfig[] = [
  // Section 1: Left Forest / River Entrance (0% - 25%)
  {
    id: "bird-forest-heron",
    name: "Marsh Heron",
    perchedSrc: "/L1.png",
    flyingSrc: "/F1.png",
    xPercent: 7.5,
    yPercent: 64.0,
    sizePx: 82,
    perchRotation: -2,
    flyDeltaX: -260,
    flyDeltaY: -360,
    flyRotation: -18,
    duration: 2.8,
  },
  {
    id: "bird-river-perch",
    name: "Azure Kingfisher",
    perchedSrc: "/L2.png",
    flyingSrc: "/F2.png",
    xPercent: 16.5,
    yPercent: 38.0,
    sizePx: 72,
    perchRotation: 3,
    flyDeltaX: 300,
    flyDeltaY: -380,
    flyRotation: 16,
    duration: 3.0,
  },
  {
    id: "bird-wetland-egret",
    name: "Wetland Egret",
    perchedSrc: "/L3.png",
    flyingSrc: "/F3.png",
    xPercent: 24.8,
    yPercent: 57.0,
    sizePx: 86,
    perchRotation: -1,
    flyDeltaX: 340,
    flyDeltaY: -420,
    flyRotation: 12,
    duration: 3.2,
  },

  // Section 2: Canopy & Lagoon (25% - 50%)
  {
    id: "bird-canopy-warbler",
    name: "Canopy Warbler",
    perchedSrc: "/L4.png",
    flyingSrc: "/F4.png",
    xPercent: 33.6,
    yPercent: 43.0,
    sizePx: 74,
    perchRotation: 2,
    flyDeltaX: -280,
    flyDeltaY: -320,
    flyRotation: -15,
    duration: 2.7,
  },
  {
    id: "bird-reed-finch",
    name: "Reed Bunting",
    perchedSrc: "/L1.png",
    flyingSrc: "/F1.png",
    xPercent: 42.0,
    yPercent: 67.0,
    sizePx: 78,
    perchRotation: -3,
    flyDeltaX: 320,
    flyDeltaY: -400,
    flyRotation: 14,
    duration: 3.1,
  },
  {
    id: "bird-high-branch",
    name: "Mountain Songbird",
    perchedSrc: "/L2.png",
    flyingSrc: "/F2.png",
    xPercent: 49.5,
    yPercent: 32.0,
    sizePx: 68,
    perchRotation: 1,
    flyDeltaX: -240,
    flyDeltaY: -350,
    flyRotation: -20,
    duration: 2.9,
  },

  // Section 3: Mid-Stream & Open Clearing (50% - 75%)
  {
    id: "bird-shallow-wader",
    name: "Lagoon Sandpiper",
    perchedSrc: "/L3.png",
    flyingSrc: "/F3.png",
    xPercent: 58.2,
    yPercent: 60.0,
    sizePx: 84,
    perchRotation: -2,
    flyDeltaX: 360,
    flyDeltaY: -440,
    flyRotation: 15,
    duration: 3.3,
  },
  {
    id: "bird-clearing-finch",
    name: "Sunlit Finch",
    perchedSrc: "/L4.png",
    flyingSrc: "/F4.png",
    xPercent: 67.0,
    yPercent: 40.0,
    sizePx: 72,
    perchRotation: 4,
    flyDeltaX: -300,
    flyDeltaY: -340,
    flyRotation: -16,
    duration: 2.8,
  },
  {
    id: "bird-driftwood-perch",
    name: "Coastal Tern",
    perchedSrc: "/L1.png",
    flyingSrc: "/F1.png",
    xPercent: 75.4,
    yPercent: 66.0,
    sizePx: 80,
    perchRotation: -1,
    flyDeltaX: 290,
    flyDeltaY: -380,
    flyRotation: 12,
    duration: 3.0,
  },

  // Section 4: Mountain Ridge & Vista Horizon (75% - 100%)
  {
    id: "bird-ridge-hawk",
    name: "Ridge Falcon",
    perchedSrc: "/L2.png",
    flyingSrc: "/F2.png",
    xPercent: 83.8,
    yPercent: 35.0,
    sizePx: 76,
    perchRotation: 2,
    flyDeltaX: 350,
    flyDeltaY: -450,
    flyRotation: 18,
    duration: 3.4,
  },
  {
    id: "bird-horizon-piper",
    name: "Horizon Petrel",
    perchedSrc: "/L3.png",
    flyingSrc: "/F3.png",
    xPercent: 91.2,
    yPercent: 52.0,
    sizePx: 82,
    perchRotation: -3,
    flyDeltaX: -260,
    flyDeltaY: -360,
    flyRotation: -14,
    duration: 3.0,
  },
  {
    id: "bird-final-vista",
    name: "Alpine Swift",
    perchedSrc: "/L4.png",
    flyingSrc: "/F4.png",
    xPercent: 96.5,
    yPercent: 44.0,
    sizePx: 74,
    perchRotation: 1,
    flyDeltaX: 280,
    flyDeltaY: -380,
    flyRotation: 16,
    duration: 2.9,
  },
];

function InteractiveBirdItem({
  bird,
  onStartle,
}: {
  bird: InteractiveBirdConfig;
  onStartle?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [isFlying, setIsFlying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const triggerFlyAway = useCallback(() => {
    if (isFlying || shouldReduceMotion) return;
    setIsFlying(true);
    onStartle?.();

    // Reset back to perched state after flight duration + rest period
    setTimeout(() => {
      setIsFlying(false);
    }, 8500);
  }, [isFlying, shouldReduceMotion, onStartle]);

  return (
    <div
      style={{
        position: "absolute",
        left: `${bird.xPercent}%`,
        top: `${bird.yPercent}%`,
        transform: "translate(-50%, -50%)",
      }}
      className="pointer-events-auto select-none group"
      onPointerEnter={() => {
        setIsHovered(true);
        triggerFlyAway();
      }}
      onPointerLeave={() => setIsHovered(false)}
      onClick={triggerFlyAway}
      onTouchStart={triggerFlyAway}
      role="button"
      aria-label={`${bird.name} - tap or hover to take flight`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          triggerFlyAway();
        }
      }}
    >
      {/* Subtle Proximity Glow / Interaction Pulse */}
      {!isFlying && (
        <div className="absolute inset-0 -m-3 rounded-full bg-cyan-400/0 group-hover:bg-cyan-400/15 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all duration-500 pointer-events-none" />
      )}

      {/* Flight Take-off Shimmer Ripple */}
      <AnimatePresence>
        {isFlying && (
          <motion.div
            initial={{ scale: 0.4, opacity: 0.7 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-0 -m-4 rounded-full border border-sky-300/40 bg-sky-400/10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isFlying ? (
          /* State 1: Perched Bird with Natural Micro-breathing */
          <motion.div
            key="perched"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: isHovered ? 1.08 : 1,
              y: shouldReduceMotion ? 0 : [-3, 3, -3],
              rotate: shouldReduceMotion
                ? bird.perchRotation
                : [
                    bird.perchRotation - 1.2,
                    bird.perchRotation + 1.2,
                    bird.perchRotation - 1.2,
                  ],
            }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{
              opacity: { duration: 0.6 },
              scale: { duration: 0.25 },
              y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              width: `clamp(${bird.sizePx * 0.65}px, ${bird.sizePx * 0.085}vh, ${bird.sizePx * 1.25}px)`,
              height: "auto",
              aspectRatio: "1/1",
              willChange: "transform, opacity",
            }}
            className="relative cursor-pointer filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-transform duration-200"
          >
            <Image
              src={bird.perchedSrc}
              alt={bird.name}
              fill
              sizes="120px"
              className="object-contain select-none pointer-events-none"
            />
          </motion.div>
        ) : (
          /* State 2: Dynamic Flight Trajectory with Flight Sprite */
          <motion.div
            key="flying"
            initial={{
              x: 0,
              y: 0,
              scale: 1,
              rotate: bird.perchRotation,
              opacity: 1,
            }}
            animate={{
              x: [0, bird.flyDeltaX * 0.35, bird.flyDeltaX],
              y: [0, -35, bird.flyDeltaY],
              scale: [1, 1.15, 0.45],
              rotate: [bird.perchRotation, bird.flyRotation * 1.1, bird.flyRotation],
              opacity: [1, 1, 0.9, 0],
            }}
            transition={{
              duration: bird.duration,
              times: [0, 0.25, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              width: `clamp(${bird.sizePx * 0.7}px, ${bird.sizePx * 0.09}vh, ${bird.sizePx * 1.3}px)`,
              height: "auto",
              aspectRatio: "1/1",
              position: "relative",
              willChange: "transform, opacity",
            }}
            className="filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] pointer-events-none select-none"
          >
            <Image
              src={bird.flyingSrc}
              alt={`${bird.name} in flight`}
              fill
              sizes="120px"
              className="object-contain select-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BirdLayer() {
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleStartle = useCallback(() => {
    if (!hasInteracted) setHasInteracted(true);
  }, [hasInteracted]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
      {/* Subtle Discovery Hint for the first few seconds of exploring the panorama */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 0.85, 0.85, 0.85] }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.5 } }}
            transition={{ duration: 8, times: [0, 0.15, 0.85, 1] }}
            style={{ left: "5.5%", top: "78%" }}
            className="absolute px-3 py-1.5 rounded-full bg-[#080c10]/80 backdrop-blur-md border border-white/10 text-[11px] tracking-[0.16em] uppercase text-zinc-300 pointer-events-none z-30 shadow-lg flex items-center space-x-2 select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Hover or tap birds to startle into flight</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Perched & Flying Birds */}
      {INTERACTIVE_BIRDS.map((bird) => (
        <InteractiveBirdItem
          key={bird.id}
          bird={bird}
          onStartle={handleStartle}
        />
      ))}
    </div>
  );
}
