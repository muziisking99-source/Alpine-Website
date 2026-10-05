import Lenis from "lenis";
import { useEffect, useRef } from "react";

/**
 * Lenis smooth scroll wrapper — only active on desktop, full capability mode.
 * Disabled on: reduced-motion, Save-Data, low-memory, mobile/touch.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Feature gate: skip smooth scroll on constrained devices or preferences
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      "connection" in navigator &&
      Boolean(
        (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
          ?.saveData,
      );
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowEnd = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const mobile = window.innerWidth < 768;

    if (reduce || saveData || lowEnd || touch || mobile) {
      return;
    }

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
