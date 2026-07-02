'use client';

import { useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** max tilt in degrees */
  max?: number;
  className?: string;
}

/**
 * Perspective tilt that follows the pointer, giving cards physical depth.
 * Mouse only (no tilt on touch), springs back on leave, and does nothing
 * for prefers-reduced-motion (handled in CSS via .tilt3d).
 */
export default function Tilt3D({ children, max = 3.5, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      `perspective(1200px) rotateX(${(-ny * max).toFixed(2)}deg) rotateY(${(nx * max).toFixed(2)}deg) translateZ(6px)`;
  }

  function onLeave() {
    const el = ref.current;
    if (el) el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`tilt3d ${className ?? ''}`}>
      {children}
    </div>
  );
}
