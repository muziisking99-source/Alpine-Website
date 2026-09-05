import {
  m,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

type SpotlightTiltProps = {
  children: ReactNode;
  className?: string;
  href: string;
  onClick?: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"];
  maxTilt?: number;
};

/**
 * React Bits–inspired TiltedCard + SpotlightCard.
 * Brand spotlight (Alpine blue / eco) — no purple glow.
 */
export function SpotlightTilt({
  children,
  className = "",
  href,
  onClick,
  maxTilt = 7,
}: SpotlightTiltProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [enabled, setEnabled] = useState(false);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 200, damping: 28, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 200, damping: 28, mass: 0.4 });

  const rotateX = useTransform(sy, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt]);
  const spotX = useTransform(sx, (v) => `${v * 100}%`);
  const spotY = useTransform(sy, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${spotX} ${spotY}, rgba(0,120,168,0.14), rgba(104,184,72,0.06) 35%, transparent 60%)`;

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    setEnabled(fine && wide);
  }, [reduce]);

  if (!enabled) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <m.a
      ref={ref}
      href={href}
      onClick={onClick}
      className={`relative isolate ${className}`}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      <m.span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1] rounded-[inherit] opacity-90 mix-blend-multiply"
        style={{ background: spotlight }}
      />
      {children}
    </m.a>
  );
}
