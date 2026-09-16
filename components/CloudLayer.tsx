"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  MotionValue,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

export interface ScatteredCloudConfig {
  id: string;
  src: string;
  leftPercent: number;
  topPercent: number;
  widthVw: number;
  opacity: number;
  depth: "background" | "foreground";
  startY: number;
  endY: number;
  driftDuration: number;
  driftDistance: number;
  delay: number;
  mouseXFactor: number;
  mouseYFactor: number;
}

const SCATTERED_CLOUDS: ScatteredCloudConfig[] = [
  // ── 1. Top-Left Bank (Huge Anchor + Small Satellite Wisp) ──
  {
    id: "cloud-tl-major",
    src: "/cloud3.png",
    leftPercent: -8,
    topPercent: -6,
    widthVw: 54, // Large anchor
    opacity: 0.88,
    depth: "background",
    startY: 18,
    endY: -22,
    driftDuration: 18,
    driftDistance: 10,
    delay: 0,
    mouseXFactor: -12,
    mouseYFactor: -8,
  },
  {
    id: "cloud-tl-wisp",
    src: "/cloud2.png",
    leftPercent: 22,
    topPercent: 8,
    widthVw: 22, // Small satellite wisp
    opacity: 0.74,
    depth: "foreground",
    startY: 30,
    endY: -40,
    driftDuration: 12,
    driftDistance: -14,
    delay: 1.0,
    mouseXFactor: -38,
    mouseYFactor: -26,
  },

  // ── 2. Bottom-Left Bank (Giant Horizon Mass + Mid Accent) ──
  {
    id: "cloud-bl-giant",
    src: "/cloud1.png",
    leftPercent: -10,
    topPercent: 62,
    widthVw: 58, // Massive anchor
    opacity: 0.86,
    depth: "background",
    startY: 20,
    endY: -26,
    driftDuration: 20,
    driftDistance: 12,
    delay: 0.5,
    mouseXFactor: -14,
    mouseYFactor: -10,
  },
  {
    id: "cloud-bl-accent",
    src: "/cloud2.png",
    leftPercent: 16,
    topPercent: 56,
    widthVw: 26, // Mid accent
    opacity: 0.76,
    depth: "foreground",
    startY: 34,
    endY: -45,
    driftDuration: 14,
    driftDistance: -12,
    delay: 1.8,
    mouseXFactor: -34,
    mouseYFactor: -24,
  },

  // ── 3. Top-Right Bank (Large Canopy + Small Drift Puff) ──
  {
    id: "cloud-tr-major",
    src: "/cloud1.png",
    leftPercent: 54,
    topPercent: -8,
    widthVw: 52, // Large anchor
    opacity: 0.88,
    depth: "background",
    startY: 22,
    endY: -28,
    driftDuration: 19,
    driftDistance: -12,
    delay: 0.8,
    mouseXFactor: -14,
    mouseYFactor: -10,
  },
  {
    id: "cloud-tr-puff",
    src: "/cloud3.png",
    leftPercent: 35,
    topPercent: 15,
    widthVw: 26, // Small satellite placed over seam
    opacity: 0.88,
    depth: "foreground",
    startY: 20,
    endY: -24,
    driftDuration: 16,
    driftDistance: 8,
    delay: 1.0,
    mouseXFactor: -20,
    mouseYFactor: -14,
  },

  // ── 4. Bottom-Right Bank (Giant Horizon Cloud Mass + Accent Wisp) ──
  {
    id: "cloud-br-major",
    src: "/cloud3.png",
    leftPercent: 48,
    topPercent: 52,
    widthVw: 66, // Substantially enlarged massive bottom-right anchor
    opacity: 0.90,
    depth: "background",
    startY: 20,
    endY: -28,
    driftDuration: 17,
    driftDistance: 14,
    delay: 1.2,
    mouseXFactor: -14,
    mouseYFactor: -10,
  },
  {
    id: "cloud-br-micro",
    src: "/cloud2.png",
    leftPercent: 74,
    topPercent: 46,
    widthVw: 24, // Accent wisp
    opacity: 0.75,
    depth: "foreground",
    startY: 38,
    endY: -50,
    driftDuration: 11,
    driftDistance: -16,
    delay: 2.6,
    mouseXFactor: -42,
    mouseYFactor: -28,
  },
];

interface CloudLayerProps {
  progress?: MotionValue<number>;
  depthFilter?: "background" | "foreground" | "all";
}

export default function CloudLayer({
  progress,
  depthFilter = "all",
}: CloudLayerProps) {
  const shouldReduceMotion = useReducedMotion();

  // Normalized mouse coordinates: -0.5 (left/top) to +0.5 (right/bottom)
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  // Smooth springs for fluid mouse parallax
  const smoothMouseX = useSpring(rawMouseX, { stiffness: 75, damping: 22, mass: 0.3 });
  const smoothMouseY = useSpring(rawMouseY, { stiffness: 75, damping: 22, mass: 0.3 });

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (e.pointerType === "touch" || typeof window === "undefined") return;
    const normX = e.clientX / window.innerWidth - 0.5;
    const normY = e.clientY / window.innerHeight - 0.5;
    rawMouseX.set(normX);
    rawMouseY.set(normY);
  }, [rawMouseX, rawMouseY]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [handlePointerMove]);

  const cloudsToRender = SCATTERED_CLOUDS.filter(
    (cloud) => depthFilter === "all" || cloud.depth === depthFilter
  );

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {cloudsToRender.map((cloud) => (
        <ScatteredCloudItem
          key={cloud.id}
          cloud={cloud}
          progress={progress}
          smoothMouseX={smoothMouseX}
          smoothMouseY={smoothMouseY}
          shouldReduceMotion={shouldReduceMotion}
        />
      ))}
    </div>
  );
}

function ScatteredCloudItem({
  cloud,
  progress,
  smoothMouseX,
  smoothMouseY,
  shouldReduceMotion,
}: {
  cloud: ScatteredCloudConfig;
  progress?: MotionValue<number>;
  smoothMouseX: MotionValue<number>;
  smoothMouseY: MotionValue<number>;
  shouldReduceMotion: boolean | null;
}) {
  // 1. Scroll-linked vertical parallax (0.54 -> 0.95)
  const defaultMotion = useTransform(
    progress || { get: () => 0.75, on: () => () => {} } as unknown as MotionValue<number>,
    [0.54, 0.95],
    [cloud.startY, cloud.endY]
  );
  const scrollParallaxY = progress ? defaultMotion : 0;

  // 2. Interactive mouse cursor parallax transforms
  const mouseOffsetX = useTransform(
    smoothMouseX,
    (normX) => (shouldReduceMotion ? 0 : normX * cloud.mouseXFactor)
  );
  const mouseOffsetY = useTransform(
    smoothMouseY,
    (normY) => (shouldReduceMotion ? 0 : normY * cloud.mouseYFactor)
  );

  return (
    /* Outer Motion Container: Drives Mouse Cursor Parallax */
    <motion.div
      style={{
        position: "absolute",
        left: `${cloud.leftPercent}%`,
        top: `${cloud.topPercent}%`,
        width: `${cloud.widthVw}vw`,
        minWidth: "180px",
        x: shouldReduceMotion ? 0 : mouseOffsetX,
        y: shouldReduceMotion ? 0 : mouseOffsetY,
        willChange: "transform",
      }}
      className="select-none overflow-visible"
    >
      {/* Inner Motion Container: Drives Scroll Parallax & Ambient Wind Drift */}
      <motion.div
        style={{
          y: shouldReduceMotion ? 0 : scrollParallaxY,
          opacity: cloud.opacity,
          willChange: "transform",
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [-cloud.driftDistance, cloud.driftDistance, -cloud.driftDistance],
              }
        }
        transition={{
          duration: cloud.driftDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: cloud.delay,
        }}
        className="filter drop-shadow-[0_6px_20px_rgba(0,0,0,0.15)] overflow-visible"
      >
        <div className="relative w-full aspect-[2/1] overflow-visible">
          <Image
            src={cloud.src}
            alt="Atmospheric scattered sky cloud"
            fill
            sizes="(max-width: 768px) 80vw, 65vw"
            className="object-contain select-none overflow-visible"
            priority
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
