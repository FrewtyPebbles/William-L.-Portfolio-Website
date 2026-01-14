"use client"
import React, { useEffect, useState, useRef } from 'react';

interface Props {
  text: string;
  className?: string; // Tailwind font size class
}

export default function TextColorer({text, className}:Props) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const spanRef = useRef<HTMLSpanElement>(null);
  // Track mouse globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    spanRef.current!.style.backgroundPosition = `${mousePos.x / window.innerWidth * 100}% ${mousePos.y / window.innerHeight * 100}%`;

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mousePos]);

  const gradientStyle = {
        background: "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
        backgroundSize: "200% 200%",
        WebkitBackgroundClip: "text" as const,
        WebkitTextFillColor: "transparent" as const,
    };

  return (
    <span
      ref={spanRef}
      style={gradientStyle}
      className={className}
    >
      {text}
    </span>
  );
}