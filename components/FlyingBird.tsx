"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export interface FlyingBirdProps {
  src: string;
  alt?: string;
  size?: number;
  initialX?: string | number;
  targetX?: string | number;
  initialY?: number;
  targetY?: number;
  duration?: number;
  delay?: number;
  rotation?: number;
  className?: string;
}

export default function FlyingBird({
  src,
  alt = "Flying bird in sky",
  size = 64,
  initialX = "-10vw",
  targetX = "110vw",
  initialY = 30,
  targetY = 25,
  duration = 18,
  delay = 0,
  rotation = 0,
  className = "",
}: FlyingBirdProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { x: "50vw", y: `${initialY}vh` }
          : { x: initialX, y: `${initialY}vh` }
      }
      animate={
        shouldReduceMotion
          ? {}
          : {
              x: targetX,
              y: [`${initialY}vh`, `${(initialY + targetY) / 2 - 1.5}vh`, `${targetY}vh`],
              rotate: [rotation - 2, rotation + 2, rotation - 2],
            }
      }
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              x: {
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              },
              y: {
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              },
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }
      }
      style={{
        position: "absolute",
        width: `${size}px`,
        height: "auto",
        aspectRatio: "1/1",
        transform: "translate(-50%, -50%)",
        willChange: "transform",
      }}
      className={`filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] select-none ${className}`}
    >
      <div className="relative w-full h-full">
        <Image src={src} alt={alt} fill sizes="120px" className="object-contain" />
      </div>
    </motion.div>
  );
}
