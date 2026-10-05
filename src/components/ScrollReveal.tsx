import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/**
 * React Bits–inspired ScrollReveal / FadeContent.
 * Opacity + translate only (Chrome-safe; no heavy filter blur).
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  y = 16,
}: ScrollRevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      {children}
    </m.div>
  );
}
