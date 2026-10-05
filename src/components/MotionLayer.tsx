import {
  m,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  type RefObject,
} from "react";

/**
 * CSS-3D stage for Alpine-eco (no WebGL).
 * Uses `m` under LazyMotion + scroll transforms only (no scroll springs).
 */

const COVER_BLUE = "#0078A8";
const COVER_DEEP = "#08648F";
const COVER_LIT = "#1A8FBE";
const PAGE = "#FBF7EF";
const PAGE_WARM = "#F5EFE3";
const RULE = "rgba(13,26,46,0.09)";
const MARGIN = "rgba(190, 70, 70, 0.22)";
const ECO = "#68B848";

/** Fixed atmospheric backdrop — light print shop paper, never black. */
export function MotionBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <MotionBackdropLayers />
    </div>
  );
}

/** @deprecated Prefer section scenes + MotionBackdrop. */
export function MotionLayer(props: {
  heroRef: RefObject<HTMLElement | null>;
  sheetsRef: RefObject<HTMLElement | null>;
  workRef: RefObject<HTMLElement | null>;
}) {
  return (
    <MotionErrorBoundary>
      <MotionBackdrop />
      <span
        className="hidden"
        data-hero={!!props.heroRef}
        data-sheets={!!props.sheetsRef}
        data-work={!!props.workRef}
      />
    </MotionErrorBoundary>
  );
}

function MotionBackdropLayers() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(165deg, #F7F9FA 0%, #EEF4F6 42%, #F3F7F8 100%)",
            "radial-gradient(ellipse 70% 55% at 78% 18%, rgba(0,120,168,0.14) 0%, transparent 62%)",
            "radial-gradient(ellipse 50% 40% at 12% 72%, rgba(104,184,72,0.10) 0%, transparent 58%)",
            "radial-gradient(ellipse 45% 30% at 50% 100%, rgba(13,26,46,0.04) 0%, transparent 70%)",
          ].join(", "),
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,120,168,0.07) 0.6px, transparent 0.6px)",
          backgroundSize: "18px 18px",
        }}
      />
    </>
  );
}

class MotionErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_e: Error, _i: ErrorInfo) {}
  render() {
    if (this.state.failed) return <MotionBackdrop />;
    return this.props.children;
  }
}

/* ─── Hero notebook ─── */

export function HeroNotebookScene({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Staged cinematic beats: closed → crack → reveal pages → pull-back
  // Each stage gets its own scroll range for readability
  const coverOpen = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.65, 1],
    reduce ? [-22, -22, -22, -22, -22] : [-18, -28, -65, -88, -95],
  );
  
  const pageReveal = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 1],
    [0, 0, 1, 1],
  );
  
  const y = useTransform(
    scrollYProgress, 
    [0, 0.7, 1], 
    [0, reduce ? 0 : -8, reduce ? 0 : -20]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.8, 1],
    [1, 1.04, 0.98, 0.96],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 top-[50%] z-[2] flex items-end justify-center pb-6 sm:inset-y-12 sm:left-auto sm:right-6 sm:top-12 sm:w-[min(100%,420px)] sm:items-center sm:pb-0 lg:right-10 lg:w-[42%]"
      style={{
        perspective: 1400,
        perspectiveOrigin: "40% 45%",
      }}
    >
      <m.div style={{ y, scale }} className="relative">
        <div className="origin-center scale-[0.7] sm:scale-[0.85] md:scale-[0.95] lg:scale-[1.05]">
          <HardCoverNotebook coverOpen={coverOpen} pageReveal={pageReveal} />
        </div>
      </m.div>
    </div>
  );
}

/* ─── Sheets fan — large + light scroll motion ─── */

export function SheetsFanScene({
  sectionRef,
  product,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  product?: { cover: string; accent: string; label: string };
}) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0.1, 0.9],
    [reduce ? 0 : 36, reduce ? 0 : -56],
  );
  const rot = useTransform(
    scrollYProgress,
    [0.1, 0.9],
    [reduce ? -4 : 10, reduce ? -4 : -14],
  );
  const spread = useTransform(
    scrollYProgress,
    [0.15, 0.55],
    reduce ? [1, 1] : [0.15, 1],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[min(520px,52%)]"
    >
      <div className="sticky top-[14vh] flex h-[72vh] items-start justify-start pl-0 sm:pl-2">
        <div style={{ perspective: 1200, perspectiveOrigin: "15% 40%" }}>
          <m.div style={{ y, rotateY: rot }}>
            <div className="origin-top-left scale-[0.82] sm:scale-[0.95] md:scale-[1.08] xl:scale-[1.18]">
              <PaperFan spread={spread} product={product} />
            </div>
          </m.div>
        </div>
      </div>
    </div>
  );
}

/* ─── Binding pile — large + light scroll motion ─── */

export function BindingPileScene({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0.15, 0.9],
    [reduce ? 0 : 32, reduce ? 0 : -48],
  );
  const rot = useTransform(
    scrollYProgress,
    [0.15, 0.9],
    [reduce ? -6 : -16, reduce ? -6 : 12],
  );
  
  // Stage progression: 0 = Print, 0.25 = Cut, 0.5 = Bind, 0.75+ = Finish
  const stage = useTransform(scrollYProgress, [0.1, 0.3, 0.5, 0.7, 0.9], [0, 1, 2, 3, 4]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[min(500px,48%)]"
    >
      <div className="sticky top-[12vh] flex h-[72vh] items-start justify-end pr-2 sm:pr-6 xl:pr-10">
        <div style={{ perspective: 1400, perspectiveOrigin: "80% 40%" }}>
          <m.div style={{ y, rotateY: rot }}>
            <div className="origin-top-right scale-[0.88] sm:scale-[1] md:scale-[1.12] xl:scale-[1.22]">
              <BoundStack stage={stage} />
            </div>
          </m.div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Hard-cover notebook — CodeFronts book-open pattern
 * Full cover over pages, hinge on LEFT spine.
 * ───────────────────────────────────────────── */

function HardCoverNotebook({
  coverOpen,
  pageReveal,
}: {
  coverOpen: MotionValue<number> | number;
  pageReveal?: MotionValue<number> | number;
}) {
  return (
    <div
      style={{
        width: 280,
        height: 390,
        position: "relative",
        transformStyle: "preserve-3d",
        transform: "rotateX(8deg) rotateY(-8deg)",
      }}
    >
      {/* Contact shadow */}
      <div
        style={{
          position: "absolute",
          left: "12%",
          right: "8%",
          bottom: -16,
          height: 36,
          background:
            "radial-gradient(ellipse at center, rgba(13,26,46,0.22) 0%, transparent 70%)",
          transform: "translateZ(-28px) rotateX(78deg)",
        }}
      />

      {/* Inner pages (full card) */}
      <m.div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "4px 8px 8px 4px",
          background: `linear-gradient(180deg, #FFFEFA 0%, ${PAGE} 100%)`,
          boxShadow: "inset 18px 0 30px -18px rgba(0,0,0,0.28)",
          overflow: "hidden",
          opacity: pageReveal || 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 10,
            background: `linear-gradient(90deg, ${COVER_DEEP}, ${COVER_BLUE})`,
          }}
        />
        <m.div
          style={{
            position: "absolute",
            left: 44,
            top: 40,
            bottom: 32,
            width: 1,
            background: MARGIN,
            opacity: pageReveal || 1,
          }}
        />
        <m.div
          style={{
            position: "absolute",
            left: 28,
            right: 24,
            top: 36,
            height: 3,
            borderRadius: 1,
            background: "rgba(104,184,72,0.55)",
            scaleX: pageReveal || 1,
            transformOrigin: "left center",
          }}
        />
        <m.div
          style={{
            position: "absolute",
            left: 28,
            right: 24,
            top: 52,
            bottom: 28,
            backgroundImage: `repeating-linear-gradient(0deg, transparent 0 17px, ${RULE} 17px 18px)`,
            opacity: pageReveal || 1,
          }}
        />
        <m.div
          style={{
            position: "absolute",
            left: 28,
            top: 62,
            width: "45%",
            height: 8,
            borderRadius: 2,
            background: "rgba(0,120,168,0.12)",
            opacity: pageReveal || 1,
          }}
        />
      </m.div>

      {/* Full cover — hinged on left spine */}
      <m.div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          rotateY: coverOpen,
          borderRadius: "4px 8px 8px 4px",
          boxShadow: "6px 10px 28px rgba(13,26,46,0.28)",
        }}
      >
        {/* Cover front */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "4px 8px 8px 4px",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: `
              radial-gradient(circle at 72% 14%, rgba(255,255,255,0.28) 0%, transparent 42%),
              linear-gradient(160deg, ${COVER_LIT} 0%, ${COVER_BLUE} 45%, ${COVER_DEEP} 100%)
            `,
            borderLeft: "6px solid #04384F",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 28px 36px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "Manrope Variable, Manrope, sans-serif",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                marginBottom: 18,
              }}
            >
              Alpine-eco
            </div>
            <div
              style={{
                fontFamily: "Syne Variable, Syne, sans-serif",
                fontWeight: 700,
                fontSize: 34,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "rgba(255,255,255,0.95)",
              }}
            >
              Notebooks
              <br />
              &amp; Diaries
            </div>
            <div
              style={{
                marginTop: 16,
                width: 44,
                height: 2,
                background: "rgba(255,255,255,0.45)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: "Manrope Variable, Manrope, sans-serif",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Printed &amp; bound
              <br />
              in Johannesburg
            </div>
            <div
              style={{
                width: 10,
                height: 52,
                flexShrink: 0,
                background: `linear-gradient(180deg, #8FD06A, ${ECO} 60%, #4F8F2E)`,
                clipPath: "polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)",
              }}
            />
          </div>
        </div>

        {/* Cover inside */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "4px 8px 8px 4px",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `linear-gradient(180deg, ${PAGE_WARM}, #E8E0D0)`,
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.18)",
          }}
        />
      </m.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Paper fan — group motion + one spread value
 * ───────────────────────────────────────────── */

const FAN = [
  { x0: 0, x1: -52, y: 6, z0: 0, z1: 16, rx: 6, ry: -12, rz0: -6, rz1: -12, tint: "#FBF8F0" },
  { x0: 6, x1: -10, y: 22, z0: 24, z1: 48, rx: 2, ry: -4, rz0: -2, rz1: -4, tint: "#FDFBF5" },
  { x0: 10, x1: 28, y: 40, z0: 48, z1: 82, rx: -2, ry: 6, rz0: 3, rz1: 8, tint: "#F7F3EA" },
  { x0: 14, x1: 68, y: 58, z0: 72, z1: 118, rx: -4, ry: 12, rz0: 6, rz1: 14, tint: "#FAF6EE" },
] as const;

function PaperFan({ 
  spread,
  product,
}: { 
  spread: MotionValue<number>;
  product?: { cover: string; accent: string; label: string };
}) {
  return (
    <div
      style={{
        width: 420,
        height: 480,
        position: "relative",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "12%",
          right: "12%",
          bottom: 8,
          height: 40,
          background:
            "radial-gradient(ellipse at center, rgba(13,26,46,0.16) 0%, transparent 70%)",
          transform: "translateZ(-24px) rotateX(72deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: "rotateX(22deg) rotateY(12deg)",
        }}
      >
        {FAN.map((s, i) => (
          <FanSheet key={i} base={s} spread={spread} index={i} product={product} />
        ))}
      </div>
      {product && (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute",
            left: 56,
            bottom: 60,
            fontFamily: "Manrope Variable, Manrope, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: product.accent,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {product.label}
        </m.div>
      )}
    </div>
  );
}

function FanSheet({
  base,
  spread,
  index,
  product,
}: {
  base: (typeof FAN)[number];
  spread: MotionValue<number>;
  index: number;
  product?: { cover: string; accent: string; label: string };
}) {
  const x = useTransform(spread, [0, 1], [base.x0, base.x1]);
  const z = useTransform(spread, [0, 1], [base.z0, base.z1]);
  const rz = useTransform(spread, [0, 1], [base.rz0, base.rz1]);

  // Use product accent on the front sheet, default for others
  const accentColor = index === 0 && product ? product.accent : "rgba(0,120,168,0.2)";

  return (
    <m.div
      style={{
        position: "absolute",
        left: 48,
        top: 20,
        width: 240,
        height: 320,
        x,
        y: base.y,
        z,
        rotateX: base.rx,
        rotateY: base.ry,
        rotateZ: rz,
        transformStyle: "preserve-3d",
      }}
    >
      <m.div
        animate={{
          background: index === 0 && product
            ? `radial-gradient(circle at 0% 40%, rgba(0,0,0,0.08), transparent 48%), ${product.cover}`
            : `radial-gradient(circle at 0% 40%, rgba(0,0,0,0.08), transparent 48%), linear-gradient(180deg, #FFFEFA 0%, ${base.tint} 100%)`,
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 4,
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.5), 0 14px 28px -12px rgba(13,26,46,0.28), 0 0 0 1px rgba(0,120,168,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 28,
            top: 28,
            bottom: 24,
            width: 1,
            background: MARGIN,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            top: 24,
            bottom: 20,
            backgroundImage: `repeating-linear-gradient(0deg, transparent 0 15px, ${RULE} 15px 16px)`,
          }}
        />
        <m.div
          animate={{
            background: accentColor,
          }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            left: 14,
            top: 20,
            width: "38%",
            height: 4,
            borderRadius: 1,
          }}
        />
      </m.div>
    </m.div>
  );
}

/* ─────────────────────────────────────────────
 * Bound stack — reliable 2.5D hardcovers
 * (cover + faked page thickness via layered shadows)
 * ───────────────────────────────────────────── */

function BoundStack({ stage }: { stage: MotionValue<number> }) {
  const books = [
    {
      x: 0,
      y: 20,
      rot: -14,
      w: 168,
      h: 228,
      cover: `linear-gradient(160deg, ${COVER_LIT} 0%, ${COVER_BLUE} 48%, ${COVER_DEEP} 100%)`,
      edge: "#0A5A78",
      label: "Notebooks",
      ink: "rgba(255,255,255,0.92)",
      rule: "rgba(255,255,255,0.45)",
    },
    {
      x: 92,
      y: 36,
      rot: 10,
      w: 156,
      h: 212,
      cover: `linear-gradient(160deg, #88C868 0%, ${ECO} 50%, #4F8F2E 100%)`,
      edge: "#3A6A22",
      label: "Diaries",
      ink: "rgba(255,255,255,0.92)",
      rule: "rgba(255,255,255,0.4)",
    },
    {
      x: 178,
      y: 52,
      rot: -5,
      w: 148,
      h: 200,
      cover: "linear-gradient(160deg, #FFFEFA 0%, #F0EAE0 100%)",
      edge: "#C8BFAF",
      label: "Journals",
      ink: "rgba(13,26,46,0.72)",
      rule: "rgba(0,120,168,0.4)",
    },
  ] as const;

  // Stage 0: Loose sheets (Print)
  // Stage 1: Trimmed stack (Cut)  
  // Stage 2: Spine visible (Bind)
  // Stage 3+: Final bound books (Finish)
  
  const stackSpread = useTransform(stage, [0, 1], [32, 0]);
  const bindingVisible = useTransform(stage, [1.5, 2.5], [0, 1]);
  const finalAssembly = useTransform(stage, [2.5, 4], [0, 1]);

  return (
    <div
      style={{
        width: 380,
        height: 320,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 20,
          bottom: 12,
          height: 28,
          background:
            "radial-gradient(ellipse at center, rgba(13,26,46,0.12) 0%, transparent 70%)",
        }}
      />
      {books.map((b, i) => {
        // Offset for print/cut stages
        const stageOffsetX = useTransform(stackSpread, [0, 32], [0, i * 18]);
        const stageOffsetY = useTransform(stackSpread, [0, 32], [0, i * -12]);
        
        return (
          <m.div
            key={i}
            style={{
              position: "absolute",
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.h,
              x: stageOffsetX,
              y: stageOffsetY,
              transform: `rotate(${b.rot}deg)`,
              transformOrigin: "bottom center",
            }}
          >
            {/* Page block / thickness - more visible during binding */}
            <m.div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 4,
                background: `
                  repeating-linear-gradient(
                    90deg,
                    #F7F2E8 0px,
                    #F7F2E8 2px,
                    #E8E0D0 2px,
                    #E8E0D0 3px
                  )
                `,
                transform: "translate(10px, 8px)",
                boxShadow: "4px 8px 18px -8px rgba(13,26,46,0.22)",
                opacity: bindingVisible,
              }}
            />
            {/* Spine strip - appears during Bind stage */}
            <m.div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 12,
                borderRadius: "4px 0 0 4px",
                background: b.edge,
                zIndex: 2,
                opacity: bindingVisible,
              }}
            />
            {/* Cover */}
            <m.div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 4,
                background: b.cover,
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.18), 0 12px 28px -14px rgba(13,26,46,0.3)",
                zIndex: 3,
                overflow: "hidden",
                opacity: finalAssembly,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 22,
                  right: 16,
                  top: 28,
                  fontFamily: "Syne Variable, Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: "-0.02em",
                  color: b.ink,
                }}
              >
                Alpine-eco
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 22,
                  top: 52,
                  width: 28,
                  height: 2,
                  background: b.rule,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 22,
                  bottom: 28,
                  fontFamily: "Manrope Variable, Manrope, sans-serif",
                  fontSize: 9,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: b.ink,
                  opacity: 0.7,
                }}
              >
                {b.label}
              </div>
            </m.div>
          </m.div>
        );
      })}
    </div>
  );
}
