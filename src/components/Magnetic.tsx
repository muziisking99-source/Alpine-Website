import {
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

/**
 * React Bits–inspired Magnet — desktop fine-pointer only.
 * Uses motion values outside React render for hover tracking.
 */
export function Magnetic({
  children,
  className = "",
  strength = 0.28,
}: MagneticProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 18, mass: 0.35 });
  const y = useSpring(my, { stiffness: 180, damping: 18, mass: 0.35 });
  // Cap travel so CTAs don't feel floaty
  const dx = useTransform(x, (v) => v * strength);
  const dy = useTransform(y, (v) => v * strength);

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    setEnabled(fine && wide);
  }, [reduce]);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      ref={ref}
      className={`inline-flex ${className}`}
      style={{ x: dx, y: dy }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        mx.set(e.clientX - cx);
        my.set(e.clientY - cy);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </m.div>
  );
}
