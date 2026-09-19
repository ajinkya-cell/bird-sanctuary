"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, animate } from "framer-motion";

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
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onFlightStateChange?: (isFlying: boolean, isComplete: boolean) => void;
}

interface DraggableStickyBirdProps {
  bird: SettledBirdConfig;
  isSettled: boolean;
  hasTriggered: boolean;
  shouldReduceMotion: boolean | null;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  zIndex: number;
  onFlightComplete: (id: string) => void;
  onStartDrag: (id: string) => void;
  registerResetHandler: (id: string, resetFn: () => void) => void;
}

function DraggableStickyBird({
  bird,
  isSettled,
  hasTriggered,
  shouldReduceMotion,
  containerRef,
  zIndex,
  onFlightComplete,
  onStartDrag,
  registerResetHandler,
}: DraggableStickyBirdProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const resetPosition = useCallback(() => {
    animate(x, 0, { type: "spring", stiffness: 220, damping: 20 });
    animate(y, 0, { type: "spring", stiffness: 220, damping: 20 });
  }, [x, y]);

  useEffect(() => {
    registerResetHandler(bird.id, resetPosition);
  }, [bird.id, registerResetHandler, resetPosition]);

  return (
    <motion.div
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
      onAnimationComplete={() => onFlightComplete(bird.id)}
      style={{
        position: "absolute",
        width: `clamp(${bird.baseSizePx * 0.7}px, ${bird.baseSizePx * 0.09}vh, ${bird.baseSizePx * 1.35}px)`,
        height: "auto",
        aspectRatio: "1/1",
        transform: "translate(-50%, -50%)",
        zIndex,
        willChange: "transform, opacity, left, top",
      }}
      className="pointer-events-none"
    >
      {/* Draggable Sticky Container */}
      <motion.div
        style={{ x, y }}
        drag={isSettled}
        dragMomentum={false}
        dragElastic={0.08}
        dragConstraints={containerRef}
        onPointerDown={() => {
          if (isSettled) {
            onStartDrag(bird.id);
          }
        }}
        onDragStart={() => {
          setIsDragging(true);
          onStartDrag(bird.id);
        }}
        onDragEnd={() => {
          setIsDragging(false);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          resetPosition();
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className={`relative w-full h-full select-none touch-none ${
          isSettled
            ? "pointer-events-auto cursor-grab active:cursor-grabbing"
            : "pointer-events-none"
        }`}
      >
        {/* Visual Artwork with Hover Lift and Peel Drag Aesthetics */}
        <motion.div
          animate={
            isSettled && !isDragging && !shouldReduceMotion
              ? {
                  y: [-2.5, 2.5, -2.5],
                  rotate: [
                    bird.rotationSettle - 1.2,
                    bird.rotationSettle + 1.2,
                    bird.rotationSettle - 1.2,
                  ],
                }
              : {}
          }
          whileHover={
            isSettled && !isDragging
              ? {
                  scale: 1.08,
                  y: -5,
                  filter:
                    "drop-shadow(0 14px 24px rgba(0,0,0,0.45)) drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
                  transition: { duration: 0.2 },
                }
              : {}
          }
          whileDrag={{
            scale: 1.18,
            rotate: bird.rotationSettle + (bird.depth === "foreground" ? 4 : -4),
            filter:
              "drop-shadow(0 24px 36px rgba(0,0,0,0.55)) drop-shadow(0 4px 10px rgba(0,0,0,0.3))",
            transition: { duration: 0.15 },
          }}
          transition={{
            y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{
            filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.35))",
          }}
          className="relative w-full h-full select-none pointer-events-none transition-shadow"
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
    </motion.div>
  );
}

export default function FlyingBirdLayer({
  isActive,
  depthFilter = "all",
  containerRef,
  onFlightStateChange,
}: FlyingBirdLayerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hasTriggered, setHasTriggered] = useState(false);
  const [completedBirds, setCompletedBirds] = useState<Record<string, boolean>>({});
  const [highestZIndex, setHighestZIndex] = useState(50);
  const [birdZIndices, setBirdZIndices] = useState<Record<string, number>>({});
  const [movedBirds, setMovedBirds] = useState<Record<string, boolean>>({});
  const resetHandlersRef = useRef<Record<string, () => void>>({});

  const birdsToRender = BIRDS.filter(
    (bird) => depthFilter === "all" || bird.depth === depthFilter
  );

  useEffect(() => {
    if (isActive) {
      setHasTriggered(true);
      onFlightStateChange?.(true, false);
    } else {
      setHasTriggered(false);
      setCompletedBirds({});
      onFlightStateChange?.(false, false);
    }
  }, [isActive, onFlightStateChange]);

  // Check when all birds complete their flight
  useEffect(() => {
    if (!hasTriggered) return;
    const allCompleted = birdsToRender.length > 0 && birdsToRender.every((b) => completedBirds[b.id]);
    if (allCompleted) {
      onFlightStateChange?.(false, true);
    }
  }, [completedBirds, birdsToRender, hasTriggered, onFlightStateChange]);

  // Fallback safety timer matching max flight duration (3.8s delay + 10.2s duration = 14.0s)
  useEffect(() => {
    if (!hasTriggered) return;
    const maxDuration = Math.max(...birdsToRender.map((b) => b.delay + b.flightDuration)) * 1000 + 400;
    const timer = setTimeout(() => {
      onFlightStateChange?.(false, true);
    }, maxDuration);
    return () => clearTimeout(timer);
  }, [hasTriggered, birdsToRender, onFlightStateChange]);

  const handleFlightComplete = useCallback((id: string) => {
    setCompletedBirds((prev) => ({ ...prev, [id]: true }));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setHighestZIndex((prev) => {
      const next = prev + 1;
      setBirdZIndices((z) => ({ ...z, [id]: next }));
      return next;
    });
    setMovedBirds((prev) => ({ ...prev, [id]: true }));
  }, []);

  const registerResetHandler = useCallback((id: string, handler: () => void) => {
    resetHandlersRef.current[id] = handler;
  }, []);

  const handleResetAll = useCallback(() => {
    Object.values(resetHandlersRef.current).forEach((fn) => fn?.());
    setMovedBirds({});
  }, []);


  const isAnySettled = Object.values(completedBirds).some(Boolean);
  const hasAnyMoved = Object.values(movedBirds).some(Boolean);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {birdsToRender.map((bird) => {
        const isSettled = !!completedBirds[bird.id];
        const zIndex = birdZIndices[bird.id] ?? (bird.depth === "foreground" ? 25 : 15);

        return (
          <DraggableStickyBird
            key={bird.id}
            bird={bird}
            isSettled={isSettled}
            hasTriggered={hasTriggered}
            shouldReduceMotion={shouldReduceMotion}
            containerRef={containerRef}
            zIndex={zIndex}
            onFlightComplete={handleFlightComplete}
            onStartDrag={bringToFront}
            registerResetHandler={registerResetHandler}
          />
        );
      })}

      {/* Subtle Sky Sticky Note Guidance Banner */}
      <AnimatePresence>
        {isAnySettled && (
          <motion.div
            key="sticky-cue-banner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.95, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto inline-flex items-center gap-2.5 bg-black/60 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full text-xs font-normal text-zinc-200 shadow-xl select-none"
            style={{ fontFamily: "var(--font-inter), 'Inter', sans-serif" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Hold and place birds anywhere like sticky notes</span>
            {hasAnyMoved && (
              <>
                <span className="text-zinc-500">•</span>
                <button
                  onClick={handleResetAll}
                  className="text-amber-300 hover:text-amber-200 font-medium transition-colors cursor-pointer underline-offset-2 hover:underline"
                >
                  Reset Flock
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
