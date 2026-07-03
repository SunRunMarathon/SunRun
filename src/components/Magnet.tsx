// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect } from "react";

interface MagnetProps {
  children: React.ReactNode;
  magnetStrength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  padding?: number;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Magnet({
  children,
  magnetStrength = 0.5,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.5s ease-in-out",
  padding = 100,
  disabled = false,
  className = "",
  style = {},
}: MagnetProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const elX = rect.left + rect.width / 2;
      const elY = rect.top + rect.height / 2;

      const distanceX = e.clientX - elX;
      const distanceY = e.clientY - elY;

      // Check if mouse is within range (element rect + padding)
      const isWithinRange =
        e.clientX >= rect.left - padding &&
        e.clientX <= rect.right + padding &&
        e.clientY >= rect.top - padding &&
        e.clientY <= rect.bottom + padding;

      if (isWithinRange) {
        setIsHovered(true);
        // Calculate offset with strength
        const targetX = distanceX * magnetStrength;
        const targetY = distanceY * magnetStrength;
        setPosition({ x: targetX, y: targetY });
      } else {
        if (isHovered) {
          setIsHovered(false);
          setPosition({ x: 0, y: 0 });
        }
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setPosition({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    ref.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      ref.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [disabled, magnetStrength, padding, isHovered]);

  const transformStyle = `translate3d(${position.x}px, ${position.y}px, 0)`;
  const transitionStyle = isHovered ? activeTransition : inactiveTransition;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transform: transformStyle,
        transition: transitionStyle,
      }}
    >
      {children}
    </div>
  );
}
