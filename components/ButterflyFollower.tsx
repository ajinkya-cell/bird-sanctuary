"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useReducedMotion } from "framer-motion";

interface ButterflyFollowerProps {
  active: boolean;
}

// Constant flight speed in pixels per second: calm, leisurely, and slow
const FLIGHT_SPEED = 210;
const SLOW_DOWN_RADIUS = 35; // px from cursor where it gently decelerates to rest

export default function ButterflyFollower({ active }: ButterflyFollowerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Position and tilt motion values updated by the constant-speed flight loop
  const smoothX = useMotionValue(-100);
  const smoothY = useMotionValue(-100);
  const smoothTilt = useMotionValue(0);

  const currentPos = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const targetPos = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const currentTilt = useRef(0);
  const animFrameId = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);

  // Detect touch screens to prevent awkward touch jumps
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (e.pointerType === "touch") return;

    const posX = e.clientX;
    const posY = e.clientY;

    targetPos.current = { x: posX, y: posY };

    // Initialize at cursor position on first detection so it doesn't fly across the screen on enter
    if (currentPos.current.x === -100) {
      currentPos.current = { x: posX, y: posY };
      smoothX.set(posX);
      smoothY.set(posY);
    }

    if (!isVisible) {
      setIsVisible(true);
    }
  }, [smoothX, smoothY, isVisible]);

  const handlePointerLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Constant-speed animation loop
  useEffect(() => {
    if (isTouchDevice || !active) {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
      return;
    }

    lastTime.current = performance.now();

    const loop = (now: number) => {
      if (!lastTime.current) lastTime.current = now;
      const dt = Math.min((now - lastTime.current) / 1000, 0.05); // Delta time clamped to 50ms
      lastTime.current = now;

      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.5) {
        // Constant speed flight: regardless of cursor speed or distance, speed is fixed.
        // Within the arrival radius, it decelerates smoothly into perch position.
        const speed = dist < SLOW_DOWN_RADIUS ? FLIGHT_SPEED * (dist / SLOW_DOWN_RADIUS) : FLIGHT_SPEED;
        const step = Math.min(dist, speed * dt);

        currentPos.current.x += (dx / dist) * step;
        currentPos.current.y += (dy / dist) * step;

        smoothX.set(currentPos.current.x);
        smoothY.set(currentPos.current.y);

        // Smooth aerodynamic banking tilt based on direction of flight
        const targetTilt = dist < 8 ? 0 : Math.max(-15, Math.min(15, (dx / dist) * 14));
        currentTilt.current += (targetTilt - currentTilt.current) * Math.min(1, dt * 5);
        smoothTilt.set(currentTilt.current);
      } else {
        // When settled, smoothly level out
        currentTilt.current += (0 - currentTilt.current) * Math.min(1, dt * 5);
        smoothTilt.set(currentTilt.current);
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
    };
  }, [active, isTouchDevice, smoothX, smoothY, smoothTilt]);

  useEffect(() => {
    if (isTouchDevice) return;

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [isTouchDevice, handlePointerMove, handlePointerLeave]);

  if (isTouchDevice) {
    return null;
  }

  const shouldShow = active && isVisible;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            x: smoothX,
            y: smoothY,
            rotate: shouldReduceMotion ? 0 : smoothTilt,
          }}
          className="fixed top-0 left-0 pointer-events-none z-50 will-change-transform"
        >
          {/* Subtle wing flutter & organic bobbing float */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scaleX: [1, 0.74, 1, 0.82, 1],
                    y: [-2.5, 2.5, -2.5],
                  }
            }
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-12 h-8 sm:w-14 sm:h-[37px] md:w-16 md:h-[42px] -translate-x-1/2 -translate-y-1/2 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
          >
            <Image
              src="/butterfly.png"
              alt="Butterfly Follower"
              fill
              sizes="(max-width: 768px) 56px, 64px"
              className="object-contain select-none pointer-events-none"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
