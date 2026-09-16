"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring, MotionValue } from "framer-motion";

export interface ClickMark {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface ClickCursorProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  progress?: MotionValue<number>;
}

export default function ClickCursor({ containerRef, progress }: ClickCursorProps) {
  const [marks, setMarks] = useState<ClickMark[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [sceneActive, setSceneActive] = useState(true);

  // Raw cursor position
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const cursorTilt = useMotionValue(0);

  // Smooth springs for fluid mouse following
  const springConfig = { stiffness: 450, damping: 32, mass: 0.2 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const smoothTilt = useSpring(cursorTilt, { stiffness: 300, damping: 25 });

  const lastPos = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // Fade out cursor when transitioning out of Scene 1
  useEffect(() => {
    if (!progress) return;
    const unsub = progress.on("change", (v) => {
      setSceneActive(v < 0.14);
    });
    return () => unsub();
  }, [progress]);

  // Check for touch capability
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (e.pointerType === "touch") return;

    let posX = e.clientX;
    let posY = e.clientY;

    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      posX = e.clientX - rect.left;
      posY = e.clientY - rect.top;
    }

    mouseX.set(posX);
    mouseY.set(posY);

    // Calculate horizontal velocity for dynamic cursor tilt
    const now = performance.now();
    const dt = Math.max(1, now - lastPos.current.time);
    const dx = posX - lastPos.current.x;
    const velocity = (dx / dt) * 16; // approximate per-frame velocity

    // Constrain tilt between -18 and 18 degrees
    const targetTilt = Math.max(-18, Math.min(18, velocity * 1.2));
    cursorTilt.set(targetTilt);

    lastPos.current = { x: posX, y: posY, time: now };

    if (!isVisible) setIsVisible(true);
  }, [containerRef, mouseX, mouseY, cursorTilt, isVisible]);

  const handlePointerLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (e.button !== 0) return;
    setIsPressed(true);

    let posX = e.clientX;
    let posY = e.clientY;

    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      posX = e.clientX - rect.left;
      posY = e.clientY - rect.top;
    }

    const newMark: ClickMark = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      x: posX,
      y: posY,
      rotation: (Math.random() - 0.5) * 26,
      scale: 0.85 + Math.random() * 0.3,
    };

    setMarks((prev) => [...prev.slice(-6), newMark]);
  }, [containerRef]);

  const handlePointerUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  useEffect(() => {
    const target = containerRef?.current || window;
    const element = target as EventTarget;

    element.addEventListener("pointermove", handlePointerMove as EventListener);
    element.addEventListener("pointerdown", handlePointerDown as EventListener);
    window.addEventListener("pointerup", handlePointerUp);
    element.addEventListener("pointerleave", handlePointerLeave as EventListener);

    return () => {
      element.removeEventListener("pointermove", handlePointerMove as EventListener);
      element.removeEventListener("pointerdown", handlePointerDown as EventListener);
      window.removeEventListener("pointerup", handlePointerUp);
      element.removeEventListener("pointerleave", handlePointerLeave as EventListener);
    };
  }, [containerRef, handlePointerMove, handlePointerDown, handlePointerUp, handlePointerLeave]);

  const removeMark = useCallback((id: string) => {
    setMarks((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden select-none">
      {/* 1. Interactive Floating Custom Cursor (desktop/mouse) */}
      {!isTouchDevice && sceneActive && (
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
            rotate: smoothTilt,
            opacity: isVisible && sceneActive ? 1 : 0,
          }}
          className="fixed top-0 left-0 pointer-events-none z-50 will-change-transform"
        >
          <motion.div
            animate={{
              scale: isPressed ? 0.82 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 24,
            }}
            className="relative w-12 h-16 md:w-16 md:h-20 -translate-x-1/2 -translate-y-1/2 filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)]"
          >
            <Image
              src="/cursor.png"
              alt="Custom Cursor"
              fill
              sizes="64px"
              className="object-contain select-none pointer-events-none"
              priority
            />
          </motion.div>
        </motion.div>
      )}

      {/* 2. Interactive Click Marks Stamp Trail */}
      <AnimatePresence>
        {marks.map((mark) => (
          <motion.div
            key={mark.id}
            initial={{
              opacity: 0,
              scale: 0.45 * mark.scale,
              rotate: mark.rotation - 8,
            }}
            animate={{
              opacity: [0, 0.9, 0.85, 0],
              scale: [0.45 * mark.scale, mark.scale, mark.scale * 1.05, mark.scale * 0.92],
              rotate: mark.rotation,
            }}
            transition={{
              duration: 1.6,
              times: [0, 0.2, 0.7, 1],
              ease: "easeOut",
            }}
            onAnimationComplete={() => removeMark(mark.id)}
            style={{
              position: "absolute",
              left: mark.x,
              top: mark.y,
              transform: "translate(-50%, -50%)",
              willChange: "transform, opacity",
            }}
            className="w-14 h-20 md:w-20 md:h-28 select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
          >
            <div className="relative w-full h-full">
              <Image
                src="/cursor.png"
                alt=""
                fill
                sizes="(max-width: 768px) 56px, 80px"
                className="object-contain select-none"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
