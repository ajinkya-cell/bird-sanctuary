"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface LotusPadProps {
  id: string;
  padSrc: string;
  padAspect: string;
  padWidthClass: string;
  positionStyle: React.CSSProperties;
  flowerSrc?: string;
  flowerAspect?: string;
  flowerScale?: number;
  flowerOffsetY?: string;
  flowerWidthClass?: string;
  floatDuration?: number;
  floatDelay?: number;
  glowSizeClass?: string;
}

export default function LotusPad({
  padSrc,
  padAspect,
  padWidthClass,
  positionStyle,
  flowerSrc = "/flower-blooming.png",
  flowerAspect = "165 / 238",
  flowerScale = 1.0,
  flowerOffsetY = "30%",
  flowerWidthClass = "w-8 sm:w-10 md:w-12 lg:w-14",
  floatDuration = 4.2,
  floatDelay = 0,
  glowSizeClass = "w-14 h-14 sm:w-18 sm:h-18",
}: LotusPadProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      style={positionStyle}
      className={`absolute z-20 pointer-events-auto select-none ${padWidthClass}`}
      animate={{ y: [0, -2.5, 0] }}
      transition={{
        duration: floatDuration,
        delay: floatDelay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered((prev) => !prev)}
    >
      {/* Blooming Flower Layer (anchored directly to the pad's top surface) */}
      <div
        style={{
          bottom: flowerOffsetY,
          left: "50%",
          transform: "translateX(-50%)",
        }}
        className="absolute pointer-events-none z-30 flex flex-col items-center justify-end"
      >
        {/* Delicate Soft Glow Aura */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.75 : 0,
            scale: isHovered ? 1.3 : 0.3,
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={`absolute -bottom-1 rounded-full bg-[#fca5a5]/35 blur-lg pointer-events-none ${glowSizeClass}`}
        />

        {/* Blooming Flower Sprite with Organic Petal Opening Spring */}
        <motion.div
          style={{
            transformOrigin: "50% 100%",
            aspectRatio: flowerAspect,
          }}
          initial={{ scaleY: 0, scaleX: 0.25, opacity: 0, y: 10 }}
          animate={{
            scaleY: isHovered ? flowerScale : 0,
            scaleX: isHovered ? flowerScale : 0.25,
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
            rotate: isHovered ? [0, 1.2, -1.2, 0] : 0,
          }}
          transition={{
            scaleY: { type: "spring", stiffness: 220, damping: 18, mass: 0.7 },
            scaleX: { type: "spring", stiffness: 200, damping: 17, mass: 0.7 },
            opacity: { duration: 0.25 },
            y: { type: "spring", stiffness: 240, damping: 20 },
            rotate: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
          }}
          className={`relative ${flowerWidthClass} filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.30)]`}
        >
          <Image
            src={flowerSrc}
            alt="Blooming lotus flower"
            fill
            sizes="(max-width: 768px) 50px, 80px"
            className="object-contain select-none pointer-events-none"
            priority
          />
        </motion.div>
      </div>

      {/* Floating Lotus Pad Base */}
      <motion.div
        style={{ aspectRatio: padAspect }}
        animate={{
          scale: isHovered ? 1.04 : 1,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full cursor-pointer filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
      >
        <Image
          src={padSrc}
          alt="Lotus pad"
          fill
          sizes="(max-width: 768px) 180px, 280px"
          className="object-contain select-none pointer-events-none"
          priority
        />
      </motion.div>
    </motion.div>
  );
}
