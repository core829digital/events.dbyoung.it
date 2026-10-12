"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Smooth scroll elegante con Lenis (disattivato con prefers-reduced-motion). */
export function SmoothScroll() {
  useEffect(() => {
    // Sincronizza lang dell'html con il cookie lingua (default it dal layout statico)
    const m = document.cookie.match(/(?:^|;\s*)ev-lang=(it|en)/);
    if (m) document.documentElement.lang = m[1];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
