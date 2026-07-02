'use client';

import { useEffect, useRef } from 'react';

/**
 * Pseudo-3D particle field behind the whole app.
 * Particles live in a z-depth space, drift slowly toward the viewer, and the
 * whole field parallaxes with the mouse. Rendered at devicePixelRatio (up to 3)
 * so it stays razor sharp on retina and 4K displays. Pauses when the tab is
 * hidden and freezes for prefers-reduced-motion.
 */
export default function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let w = 0;
    let h = 0;

    interface P { x: number; y: number; z: number; yellow: boolean; tw: number }
    const N = 130;
    const parts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 0.9 + 0.1,
      yellow: Math.random() < 0.16,
      tw: Math.random() * Math.PI * 2,
    }));

    let mx = 0, my = 0;   // parallax target
    let px = 0, py = 0;   // eased parallax

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    let t = 0;
    function draw() {
      ctx!.clearRect(0, 0, w, h);
      t += 0.016;
      px += (mx - px) * 0.04;
      py += (my - py) * 0.04;
      const cx = w / 2;
      const cy = h / 2;

      for (const p of parts) {
        if (!reduced) {
          p.z -= 0.00055;
          if (p.z < 0.09) {
            p.z = 1;
            p.x = Math.random() * 2 - 1;
            p.y = Math.random() * 2 - 1;
          }
        }
        const persp = 0.55 / p.z;
        const x = cx + p.x * cx * persp + px * 26 * (1 - p.z);
        const y = cy + p.y * cy * persp + py * 26 * (1 - p.z);
        if (x < -12 || x > w + 12 || y < -12 || y > h + 12) continue;

        const depth = 1 - p.z;
        const twinkle = 0.75 + 0.25 * Math.sin(t * 1.4 + p.tw);
        const r = Math.max(0.5, depth * 2.2) * twinkle;
        const a = Math.min(0.85, depth * 0.85 + 0.06) * twinkle;

        if (p.yellow) {
          ctx!.shadowColor = 'rgba(255,255,30,0.9)';
          ctx!.shadowBlur = 10;
          ctx!.fillStyle = `rgba(255,255,30,${a * 0.85})`;
        } else {
          ctx!.shadowBlur = 0;
          ctx!.fillStyle = `rgba(255,255,255,${a * 0.4})`;
        }
        ctx!.beginPath();
        ctx!.arc(x, y, r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.shadowBlur = 0;
      if (!reduced) raf = requestAnimationFrame(draw);
    }

    function onMouse(e: MouseEvent) {
      mx = (e.clientX / w) * 2 - 1;
      my = (e.clientY / h) * 2 - 1;
    }
    function onVis() {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0 z-0 pointer-events-none" />;
}
