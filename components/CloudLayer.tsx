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
  aspectRatio: string;
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
  // ── Background Layer (Anchors & Horizon Masses) ──
  {
    id: "cloud-new-1",
    src: "/cloud-new1.png",
    aspectRatio: "1710/863",
    leftPercent: -6,
    topPercent: -4,
    widthVw: 52,
    opacity: 0.90,
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
    id: "cloud-new-9",
    src: "/cloud-new9.png",
    aspectRatio: "925/305",
    leftPercent: 28,
    topPercent: -6,
    widthVw: 48,
    opacity: 0.88,
    depth: "background",
    startY: 20,
    endY: -26,
    driftDuration: 19,
    driftDistance: -12,
    delay: 0.7,
    mouseXFactor: -14,
    mouseYFactor: -10,
  },
  {
    id: "cloud-new-6",
    src: "/cloud-new6.png",
    aspectRatio: "638/278",
    leftPercent: 62,
    topPercent: -2,
    widthVw: 42,
    opacity: 0.88,
    depth: "background",
    startY: 22,
    endY: -28,
    driftDuration: 17,
    driftDistance: 12,
    delay: 1.2,
    mouseXFactor: -14,
    mouseYFactor: -10,
  },
  {
    id: "cloud-new-3",
    src: "/cloud-new3.png",
    aspectRatio: "703/181",
    leftPercent: 10,
    topPercent: 42,
    widthVw: 38,
    opacity: 0.82,
    depth: "background",
    startY: 24,
    endY: -30,
    driftDuration: 16,
    driftDistance: -10,
    delay: 0.4,
    mouseXFactor: -16,
    mouseYFactor: -12,
  },
  {
    id: "cloud-new-2",
    src: "/cloud-new2.png",
    aspectRatio: "1405/630",
    leftPercent: 48,
    topPercent: 52,
    widthVw: 58,
    opacity: 0.92,
    depth: "background",
    startY: 20,
    endY: -28,
    driftDuration: 17,
    driftDistance: 14,
    delay: 1.0,
    mouseXFactor: -14,
    mouseYFactor: -10,
  },
  {
    id: "cloud-new-8",
    src: "/cloud-new8.png",
    aspectRatio: "505/177",
    leftPercent: -4,
    topPercent: 66,
    widthVw: 36,
    opacity: 0.84,
    depth: "background",
    startY: 22,
    endY: -26,
    driftDuration: 18,
    driftDistance: 8,
    delay: 1.5,
    mouseXFactor: -14,
    mouseYFactor: -10,
  },
  {
    id: "cloud-new-1-b",
    src: "/cloud-new1.png",
    aspectRatio: "1710/863",
    leftPercent: 74,
    topPercent: -5,
    widthVw: 44,
    opacity: 0.88,
    depth: "background",
    startY: 20,
    endY: -24,
    driftDuration: 19,
    driftDistance: -10,
    delay: 0.5,
    mouseXFactor: -12,
    mouseYFactor: -8,
  },
  {
    id: "cloud-new-3-b",
    src: "/cloud-new3.png",
    aspectRatio: "703/181",
    leftPercent: -8,
    topPercent: 24,
    widthVw: 36,
    opacity: 0.82,
    depth: "background",
    startY: 22,
    endY: -28,
    driftDuration: 17,
    driftDistance: 10,
    delay: 1.1,
    mouseXFactor: -14,
    mouseYFactor: -10,
  },
  {
    id: "cloud-new-6-b",
    src: "/cloud-new6.png",
    aspectRatio: "638/278",
    leftPercent: 24,
    topPercent: 58,
    widthVw: 40,
    opacity: 0.86,
    depth: "background",
    startY: 24,
    endY: -30,
    driftDuration: 18,
    driftDistance: -12,
    delay: 1.4,
    mouseXFactor: -14,
    mouseYFactor: -10,
  },
  {
    id: "cloud-new-9-b",
    src: "/cloud-new9.png",
    aspectRatio: "925/305",
    leftPercent: 68,
    topPercent: 70,
    widthVw: 46,
    opacity: 0.86,
    depth: "background",
    startY: 20,
    endY: -26,
    driftDuration: 16,
    driftDistance: 12,
    delay: 0.9,
    mouseXFactor: -14,
    mouseYFactor: -10,
  },

  // ── Foreground Layer (Parallax Wisps & Accent Puffs) ──
  {
    id: "cloud-new-4",
    src: "/cloud-new4.png",
    aspectRatio: "279/177",
    leftPercent: 25,
    topPercent: 12,
    widthVw: 16,
    opacity: 0.80,
    depth: "foreground",
    startY: 32,
    endY: -42,
    driftDuration: 12,
    driftDistance: -14,
    delay: 0.8,
    mouseXFactor: -36,
    mouseYFactor: -24,
  },
  {
    id: "cloud-new-5",
    src: "/cloud-new5.png",
    aspectRatio: "450/221",
    leftPercent: 44,
    topPercent: 26,
    widthVw: 22,
    opacity: 0.78,
    depth: "foreground",
    startY: 28,
    endY: -38,
    driftDuration: 14,
    driftDistance: 10,
    delay: 1.6,
    mouseXFactor: -32,
    mouseYFactor: -22,
  },
  {
    id: "cloud-new-7",
    src: "/cloud-new7.png",
    aspectRatio: "553/157",
    leftPercent: 68,
    topPercent: 40,
    widthVw: 26,
    opacity: 0.78,
    depth: "foreground",
    startY: 34,
    endY: -46,
    driftDuration: 13,
    driftDistance: -15,
    delay: 2.2,
    mouseXFactor: -38,
    mouseYFactor: -26,
  },
  {
    id: "cloud-new-10",
    src: "/cloud-new10.png",
    aspectRatio: "389/162",
    leftPercent: 18,
    topPercent: 70,
    widthVw: 22,
    opacity: 0.76,
    depth: "foreground",
    startY: 36,
    endY: -48,
    driftDuration: 11,
    driftDistance: 12,
    delay: 2.5,
    mouseXFactor: -40,
    mouseYFactor: -28,
  },
  {
    id: "cloud-new-4-b",
    src: "/cloud-new4.png",
    aspectRatio: "279/177",
    leftPercent: 56,
    topPercent: 8,
    widthVw: 18,
    opacity: 0.80,
    depth: "foreground",
    startY: 30,
    endY: -40,
    driftDuration: 13,
    driftDistance: 12,
    delay: 1.1,
    mouseXFactor: -34,
    mouseYFactor: -24,
  },
  {
    id: "cloud-new-5-b",
    src: "/cloud-new5.png",
    aspectRatio: "450/221",
    leftPercent: 82,
    topPercent: 28,
    widthVw: 22,
    opacity: 0.78,
    depth: "foreground",
    startY: 32,
    endY: -44,
    driftDuration: 14,
    driftDistance: -14,
    delay: 1.8,
    mouseXFactor: -36,
    mouseYFactor: -24,
  },
  {
    id: "cloud-new-7-b",
    src: "/cloud-new7.png",
    aspectRatio: "553/157",
    leftPercent: 6,
    topPercent: 52,
    widthVw: 24,
    opacity: 0.78,
    depth: "foreground",
    startY: 34,
    endY: -46,
    driftDuration: 12,
    driftDistance: 14,
    delay: 2.0,
    mouseXFactor: -38,
    mouseYFactor: -26,
  },
  {
    id: "cloud-new-10-b",
    src: "/cloud-new10.png",
    aspectRatio: "389/162",
    leftPercent: 52,
    topPercent: 74,
    widthVw: 20,
    opacity: 0.76,
    depth: "foreground",
    startY: 36,
    endY: -48,
    driftDuration: 12,
    driftDistance: -12,
    delay: 2.3,
    mouseXFactor: -40,
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
  // 1. Scroll-linked vertical parallax (0.44 -> 0.66)
  const defaultMotion = useTransform(
    progress || { get: () => 0.50, on: () => () => {} } as unknown as MotionValue<number>,
    [0.44, 0.66],
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
        <div className="relative w-full overflow-visible" style={{ aspectRatio: cloud.aspectRatio }}>
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
