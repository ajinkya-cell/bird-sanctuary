"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, MotionValue, useTransform, useReducedMotion } from "framer-motion";
import ClickCursor from "./ClickCursor";
import WaterRippleCanvas from "./WaterRippleCanvas";
import LotusPad from "./LotusPad";

interface HeroSceneProps {
  progress: MotionValue<number>;
}

export default function HeroScene({ progress }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Active from progress 0 to 0.08
  // Natural vertical slide upwards as user scrolls down
  const y = useTransform(progress, [0, 0.08], ["0%", "-100%"]);
  const opacity = useTransform(progress, (p) => (p >= 0.08 ? 0 : 1));
  
  const pointerEvents = useTransform(progress, (p) => (p >= 0.08 ? "none" : "auto"));



  return (
    <motion.div
      ref={containerRef}
      style={{
        y: shouldReduceMotion ? 0 : y,
        opacity,
        pointerEvents: pointerEvents as unknown as React.CSSProperties["pointerEvents"],
      }}
      className="absolute inset-0 w-full h-full overflow-hidden bg-[#ede7dd] cursor-none select-none z-30 will-change-transform"
    >
      {/* Top Title: Welcome to the world of \n Kaladev */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
        className="absolute top-6 sm:top-8 md:top-10 inset-x-0 z-20 flex flex-col items-center justify-center text-center pointer-events-none px-4 select-none"
      >
        <h1 className="flex flex-col items-center text-center tracking-[0.02em]">
          <span
            style={{
              fontFamily: "var(--font-alegreya), 'Alegreya', Georgia, serif",
              textShadow: "0 2px 8px rgba(46, 38, 31, 0.22), 0 1px 2px rgba(0, 0, 0, 0.16)",
            }}
            className="text-xl sm:text-2xl pt-20 md:text-4xl lg:text-[42px] font-normal text-[#2e261f] leading-tight"
          >
            Welcome to the true avian paradise
          </span>
          <span
            style={{
              fontFamily: "var(--font-cedarville), 'Cedarville Cursive', cursive",
              filter: "drop-shadow(0 2px 4px rgba(125, 81, 40, 0.18))",
            }}
            className="font-normal text-4xl sm:text-5xl md:text-6xl lg:text-8xl bg-gradient-to-r from-[#2d241e] via-[#7d5128] to-[#be8235] bg-clip-text text-transparent mt-1 sm:mt-2 leading-tight"
          >
            Keoladeo
          </span>
        </h1>
      </motion.header>

      {/* Fullscreen Base Artwork and Water (Edge-to-edge covering full desktop space) */}
      <motion.div
        className="relative w-full h-full will-change-transform overflow-hidden select-none"
      >
        {/* Layer 1: Static Base Front Artwork (Edge-to-edge cover anchored to bottom) */}
        <Image
          src="/frontnew.png"
          alt="Opening visual world"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center bottom" }}
          className="object-cover object-bottom select-none pointer-events-none"
          quality={100}
        />

        {/* Layer 2: Water Layer Overlay (interactive ripples or static fallback) */}
        {shouldReduceMotion ? (
          <Image
            src="/new-water-again.png"
            alt="Water surface"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center bottom" }}
            className="object-cover object-bottom select-none pointer-events-none"
            quality={100}
          />
        ) : (
          <WaterRippleCanvas
            imageSrc="/new-water-again.png"
            progress={progress}
            rippleIntensity={0.016}
          />
        )}

        {/* Layer 3: Water Highlight Overlay */}
        <Image
          src="/water-highlight.png"
          alt="Water highlight"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center bottom" }}
          className="object-cover object-bottom select-none pointer-events-none"
          quality={100}
        />

        {/* Layer 4: Interactive Floating Lotus Pads with Blooming Flowers */}
        {/* 1. Left Cluster - Main Blossom (flower1) */}
        <LotusPad
          id="lotus-1"
          padSrc="/lotus1.png"
          padAspect="282 / 64"
          padWidthClass="w-20 sm:w-24 md:w-28 lg:w-32"
          positionStyle={{ left: "33%", bottom: "13%" }}
          flowerSrc="/flower-blooming.png"
          flowerAspect="165 / 238"
          flowerScale={1.0}
          flowerOffsetY="26%"
          flowerWidthClass="w-7 sm:w-8 md:w-10 lg:w-12"
          floatDuration={4.0}
          floatDelay={0}
        />

        {/* 2. Left Cluster - Small Bud (flower2 scaled down) */}
        <LotusPad
          id="lotus-3"
          padSrc="/lotus1.png"
          padAspect="282 / 64"
          padWidthClass="w-16 sm:w-18 md:w-22 lg:w-26"
          positionStyle={{ left: "25%", bottom: "17%" }}
          flowerSrc="/flower2-blooming.png"
          flowerAspect="97 / 224"
          flowerScale={0.75}
          flowerOffsetY="26%"
          flowerWidthClass="w-4 sm:w-5 md:w-6 lg:w-7"
          glowSizeClass="w-10 h-10 sm:w-12 sm:h-12"
          floatDuration={4.4}
          floatDelay={2.2}
        />

        {/* 3. Left-most Foreground - Tiny Bud (flower2 scaled down) */}
        <LotusPad
          id="lotus-4"
          padSrc="/lotus1.png"
          padAspect="282 / 64"
          padWidthClass="w-14 sm:w-16 md:w-18 lg:w-22"
          positionStyle={{ left: "17%", bottom: "12%" }}
          flowerSrc="/flower2-blooming.png"
          flowerAspect="97 / 224"
          flowerScale={0.68}
          flowerOffsetY="25%"
          flowerWidthClass="w-3.5 sm:w-4 md:w-5 lg:w-6"
          glowSizeClass="w-8 h-8 sm:w-10 sm:h-10"
          floatDuration={3.8}
          floatDelay={0.8}
        />

        {/* 4. Center Midground - Distant Bud (flower2 scaled down) */}
        <LotusPad
          id="lotus-5"
          padSrc="/lotus2.png"
          padAspect="344 / 106"
          padWidthClass="w-18 sm:w-20 md:w-24 lg:w-28"
          positionStyle={{ left: "45%", bottom: "19%" }}
          flowerSrc="/flower2-blooming.png"
          flowerAspect="97 / 224"
          flowerScale={0.72}
          flowerOffsetY="28%"
          flowerWidthClass="w-4 sm:w-5 md:w-6 lg:w-7"
          glowSizeClass="w-10 h-10 sm:w-12 sm:h-12"
          floatDuration={4.5}
          floatDelay={3.1}
        />

        {/* 5. Center-Right Foreground - Blossom (flower1) */}
        <LotusPad
          id="lotus-6"
          padSrc="/lotus1.png"
          padAspect="282 / 64"
          padWidthClass="w-18 sm:w-22 md:w-26 lg:w-30"
          positionStyle={{ left: "57%", bottom: "14%" }}
          flowerSrc="/flower-blooming.png"
          flowerAspect="165 / 238"
          flowerScale={0.95}
          flowerOffsetY="26%"
          flowerWidthClass="w-6 sm:w-7 md:w-9 lg:w-11"
          floatDuration={4.1}
          floatDelay={1.9}
        />

        {/* 6. Right Midground - Main Blossom (flower1) */}
        <LotusPad
          id="lotus-2"
          padSrc="/lotus2.png"
          padAspect="344 / 106"
          padWidthClass="w-24 sm:w-28 md:w-32 lg:w-36"
          positionStyle={{ left: "74%", bottom: "21%" }}
          flowerSrc="/flower-blooming.png"
          flowerAspect="165 / 238"
          flowerScale={1.0}
          flowerOffsetY="28%"
          flowerWidthClass="w-8 sm:w-9 md:w-11 lg:w-14"
          floatDuration={4.6}
          floatDelay={1.4}
        />

        {/* 7. Far Right - Small Bud (flower2 scaled down) */}
        <LotusPad
          id="lotus-7"
          padSrc="/lotus1.png"
          padAspect="282 / 64"
          padWidthClass="w-16 sm:w-18 md:w-22 lg:w-24"
          positionStyle={{ left: "82%", bottom: "17%" }}
          flowerSrc="/flower2-blooming.png"
          flowerAspect="97 / 224"
          flowerScale={0.72}
          flowerOffsetY="26%"
          flowerWidthClass="w-4 sm:w-5 md:w-6 lg:w-7"
          glowSizeClass="w-10 h-10 sm:w-12 sm:h-12"
          floatDuration={4.3}
          floatDelay={2.7}
        />
      </motion.div>

      {/* Interactive custom cursor & click marks */}
      <ClickCursor containerRef={containerRef} progress={progress} />
    </motion.div>
  );
}
