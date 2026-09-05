import { m, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type BlurTextProps = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  stagger?: number;
  animateBy?: "words" | "letters";
  /** `mount` for hero; `view` for section openers (ScrollReveal-style). */
  trigger?: "mount" | "view";
};

/**
 * Staggered word/letter reveal — opacity + transform only (no filter blur).
 */
export function BlurText({
  text,
  className = "",
  as = "span",
  delay = 0,
  stagger = 0.06,
  animateBy = "words",
  trigger = "mount",
}: BlurTextProps) {
  const reduce = useReducedMotion();
  const Tag = m[as];

  const units = useMemo(() => {
    if (animateBy === "letters") return text.split("");
    return text.split(/(\s+)/);
  }, [text, animateBy]);

  if (reduce) {
    const Static = as;
    return <Static className={className}>{text}</Static>;
  }

  const triggerProps =
    trigger === "view"
      ? {
          initial: "hidden" as const,
          whileInView: "show" as const,
          viewport: { once: true, amount: 0.35 },
        }
      : {
          initial: "hidden" as const,
          animate: "show" as const,
        };

  return (
    <Tag
      className={className}
      {...triggerProps}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      aria-label={text}
    >
      {units.map((unit, i) => {
        const isSpace = /^\s+$/.test(unit);
        if (isSpace) {
          return <span key={`s-${i}`}>{unit}</span>;
        }
        return (
          <m.span
            key={`${unit}-${i}`}
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.35, ease: EASE },
              },
            }}
            aria-hidden
          >
            {unit}
          </m.span>
        );
      })}
    </Tag>
  );
}
