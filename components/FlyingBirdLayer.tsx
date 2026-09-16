"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export interface SettledBirdConfig {
  id: string;
  src: string;
  alt: string;
  name: string;
  baseSizePx: number;
  startX: string;
  startY: string;
  targetLeftPercent: number;
  targetTopPercent: number;
  flightDuration: number;
  delay: number;
  rotationFlight: number;
  rotationSettle: number;
  startScale: number;
  peakScale: number;
  settleScale: number;
  depth: "foreground" | "midground";
}

const BIRDS: SettledBirdConfig[] = [
  // 1. Forefront Hero Apex Soarer (Swoops closest to camera)
  {
    id: "bird-hero-forefront",
    src: "/F2.png",
    alt: "Grand Forefront Falcon",
    name: "Apex Falcon",
    baseSizePx: 155,
    startX: "-35vw",
    startY: "42vh",
    targetLeftPercent: 70,
    targetTopPercent: 32,
    flightDuration: 7.2,
    delay: 0.1,
    rotationFlight: -3,
    rotationSettle: 2,
    startScale: 0.35,
    peakScale: 1.90,
    settleScale: 1.68,
    depth: "foreground",
  },
  // 2. High Left Upper Soarer
  {
    id: "bird-high-left-soarer",
    src: "/F1.png",
    alt: "High Soaring Swift",
    name: "Alpine Swift",
    baseSizePx: 135,
    startX: "-28vw",
    startY: "14vh",
    targetLeftPercent: 22,
    targetTopPercent: 26,
    flightDuration: 7.8,
    delay: 0.4,
    rotationFlight: -6,
    rotationSettle: -1,
    startScale: 0.30,
    peakScale: 1.68,
    settleScale: 1.48,
    depth: "foreground",
  },
  // 3. Center High Horizon Hawk
  {
    id: "bird-center-glider",
    src: "/F3.png",
    alt: "Center Gliding Tern",
    name: "Azure Tern",
    baseSizePx: 125,
    startX: "-30vw",
    startY: "20vh",
    targetLeftPercent: 48,
    targetTopPercent: 22,
    flightDuration: 8.2,
    delay: 0.9,
    rotationFlight: -4,
    rotationSettle: 1,
    startScale: 0.32,
    peakScale: 1.55,
    settleScale: 1.38,
    depth: "midground",
  },
  // 4. Low Right Prominent Ascender
  {
    id: "bird-low-right-ascender",
    src: "/F4.png",
    alt: "Ascending Harrier",
    name: "Marsh Harrier",
    baseSizePx: 145,
    startX: "-32vw",
    startY: "65vh",
    targetLeftPercent: 85,
    targetTopPercent: 46,
    flightDuration: 8.6,
    delay: 1.4,
    rotationFlight: -2,
    rotationSettle: -2,
    startScale: 0.36,
    peakScale: 1.75,
    settleScale: 1.55,
    depth: "foreground",
  },
  // 5. Mid-Left Open Sky Glider
  {
    id: "bird-mid-left-glider",
    src: "/F1.png",
    alt: "Mid Sky Glider",
    name: "Sky Petrel",
    baseSizePx: 120,
    startX: "-26vw",
    startY: "40vh",
    targetLeftPercent: 34,
    targetTopPercent: 52,
    flightDuration: 9.0,
    delay: 2.0,
    rotationFlight: -5,
    rotationSettle: 0,
    startScale: 0.30,
    peakScale: 1.48,
    settleScale: 1.30,
    depth: "midground",
  },
  // 6. Deep High Horizon Swift
  {
    id: "bird-distant-high",
    src: "/F3.png",
    alt: "High Altitude Swift",
    name: "Horizon Hawk",
    baseSizePx: 110,
    startX: "-22vw",
    startY: "10vh",
    targetLeftPercent: 92,
    targetTopPercent: 20,
    flightDuration: 9.4,
    delay: 2.6,
    rotationFlight: -7,
    rotationSettle: -2,
    startScale: 0.26,
    peakScale: 1.40,
    settleScale: 1.22,
    depth: "midground",
  },
  // 7. Mid-Center Horizon Explorer
  {
    id: "bird-right-horizon",
    src: "/F4.png",
    alt: "Horizon Coastal Glider",
    name: "Coastal Skimmer",
    baseSizePx: 115,
    startX: "-24vw",
    startY: "58vh",
    targetLeftPercent: 58,
    targetTopPercent: 60,
    flightDuration: 9.8,
    delay: 3.2,
    rotationFlight: -4,
    rotationSettle: 1,
    startScale: 0.28,
    peakScale: 1.42,
    settleScale: 1.25,
    depth: "midground",
  },
  // 8. Lower Left Horizon Wanderer
  {
    id: "bird-low-left-deep",
    src: "/F2.png",
    alt: "Distant Low Osprey",
    name: "Mist Osprey",
    baseSizePx: 130,
    startX: "-24vw",
    startY: "70vh",
    targetLeftPercent: 14,
    targetTopPercent: 62,
    flightDuration: 10.2,
    delay: 3.8,
    rotationFlight: -5,
    rotationSettle: -1,
    startScale: 0.32,
    peakScale: 1.50,
    settleScale: 1.32,
    depth: "midground",
  },
];

interface FlyingBirdLayerProps {
  isActive: boolean;
  depthFilter?: "foreground" | "midground" | "all";
}

export default function FlyingBirdLayer({
  isActive,
  depthFilter = "all",
}: FlyingBirdLayerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hasTriggered, setHasTriggered] = useState(false);
  const [completedBirds, setCompletedBirds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isActive && !hasTriggered) {
      setHasTriggered(true);
    }
  }, [isActive, hasTriggered]);

  const handleFlightComplete = (id: string) => {
    setCompletedBirds((prev) => ({ ...prev, [id]: true }));
  };

  const birdsToRender = BIRDS.filter(
    (bird) => depthFilter === "all" || bird.depth === depthFilter
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {birdsToRender.map((bird) => {
        const isSettled = completedBirds[bird.id];

        return (
          <motion.div
            key={bird.id}
            initial={
              shouldReduceMotion
                ? {
                    left: `${bird.targetLeftPercent}%`,
                    top: `${bird.targetTopPercent}%`,
                    opacity: 1,
                    scale: bird.settleScale,
                    rotate: bird.rotationSettle,
                  }
                : {
                    left: "0%",
                    top: bird.startY,
                    x: bird.startX,
                    y: 0,
                    opacity: 0,
                    scale: bird.startScale,
                    rotate: bird.rotationFlight,
                  }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : hasTriggered
                ? {
                    left: `${bird.targetLeftPercent}%`,
                    top: `${bird.targetTopPercent}%`,
                    x: "0vw",
                    y: ["0vh", "-3.5vh", "0vh"],
                    opacity: [0, 0.95, 1, 1],
                    // Dramatic scale approach: starts small in distance, expands as it comes closer, then settles
                    scale: [bird.startScale, bird.peakScale, bird.settleScale],
                    rotate: [
                      bird.rotationFlight,
                      bird.rotationFlight - 2,
                      bird.rotationSettle,
                    ],
                  }
                : {
                    left: "0%",
                    top: bird.startY,
                    x: bird.startX,
                    opacity: 0,
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: bird.flightDuration,
                    delay: bird.delay,
                    times: [0, 0.75, 1],
                    ease: [0.18, 1, 0.32, 1],
                  }
            }
            onAnimationComplete={() => handleFlightComplete(bird.id)}
            style={{
              position: "absolute",
              width: `clamp(${bird.baseSizePx * 0.7}px, ${bird.baseSizePx * 0.09}vh, ${bird.baseSizePx * 1.35}px)`,
              height: "auto",
              aspectRatio: "1/1",
              transform: "translate(-50%, -50%)",
              willChange: "transform, opacity, left, top",
            }}
            className="filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] select-none pointer-events-auto group cursor-pointer"
          >
            {/* Ambient micro-soaring & thermal lift once settled in formation */}
            <motion.div
              animate={
                isSettled && !shouldReduceMotion
                  ? {
                      y: [-3, 3, -3],
                      rotate: [
                        bird.rotationSettle - 1.2,
                        bird.rotationSettle + 1.2,
                        bird.rotationSettle - 1.2,
                      ],
                    }
                  : {}
              }
              whileHover={{
                scale: 1.12,
                y: -6,
                transition: { duration: 0.25 },
              }}
              transition={{
                duration: 5.0,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full h-full transition-transform"
            >
              <Image
                src={bird.src}
                alt={bird.alt}
                fill
                sizes="180px"
                className="object-contain select-none pointer-events-none"
                priority
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
