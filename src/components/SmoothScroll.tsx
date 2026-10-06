import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Lenis smooth scroll wrapper — only active on desktop, full capability mode.
 * Disabled on: reduced-motion, Save-Data, low-memory, mobile/touch.
 * Deferred until after first paint to avoid blocking initial render.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

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

    // Defer Lenis init until after first paint — avoids blocking shell render
    let cancelled = false;
    const initLenis = () => {
      if (cancelled) return;
      
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
      setLenisInstance(lenis);

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    };

    // Wait until browser is idle or 2s max, whichever comes first
    const timeoutId = window.setTimeout(initLenis, 2000);
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(
        () => {
          window.clearTimeout(timeoutId);
          initLenis();
        },
        { timeout: 2000 }
      );
    }

    // Cleanup
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
