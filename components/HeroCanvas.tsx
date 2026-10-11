"use client";
import { useEffect, useRef } from "react";

/** Sharp QRS-like heartbeat complex, phase in [0, 1). */
function spike(phase: number): number {
  const g = (c: number, w: number) => Math.exp(-((phase - c) ** 2) / w);
  return g(0.3, 0.0006) * 1.0 - g(0.335, 0.00025) * 0.35 + g(0.37, 0.0009) * 0.55 + g(0.62, 0.002) * 0.18;
}

/** Full-bleed animated EKG trace field for the hero. Static frame when reduced motion is preferred. */
export function HeroCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // cursor position bends the traces toward it (ignored with reduced motion)
    const mouse = { x: -9999 };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
    };
    if (!reduced) window.addEventListener("mousemove", onMove);

    const traces = [
      { base: 0.44, amp: 52, speed: 0.055, period: 340, color: "rgba(52,211,153,0.55)", width: 1.6 },
      { base: 0.6, amp: 30, speed: 0.04, period: 420, color: "rgba(255,255,255,0.20)", width: 1.2 },
      { base: 0.3, amp: 22, speed: 0.07, period: 260, color: "rgba(52,211,153,0.28)", width: 1.2 },
      { base: 0.72, amp: 18, speed: 0.05, period: 500, color: "rgba(255,255,255,0.12)", width: 1 },
    ];

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const tr of traces) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          // traces swell and lift toward the cursor
          const dx = (x - mouse.x) / Math.max(1, w);
          const near = Math.exp(-(dx * dx) / 0.004);
          const boost = 1 + near * 1.8;
          const phase = ((((x + t * tr.speed) % tr.period) + tr.period) % tr.period) / tr.period;
          const y = h * tr.base - spike(phase) * tr.amp * boost + Math.sin((x + t * 0.02) / 60) * 4 - near * 26;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = tr.color;
        ctx.lineWidth = tr.width;
        ctx.stroke();
      }
      // traveling signal packet on the main trace
      const m = traces[0];
      const px = ((t * 0.35) % (w + 80)) - 40;
      const phase = ((((px + t * m.speed) % m.period) + m.period) % m.period) / m.period;
      const py = h * m.base - spike(phase) * m.amp;
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 14);
      glow.addColorStop(0, "rgba(52,211,153,0.9)");
      glow.addColorStop(1, "rgba(52,211,153,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#a7f3d0";
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    };

    if (reduced) {
      draw(1200);
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMove);
      };
    }

    let raf = 0;
    let visible = true;
    const obs = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    obs.observe(canvas);
    const loop = (t: number) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      obs.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
