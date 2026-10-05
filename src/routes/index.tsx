import { createFileRoute } from "@tanstack/react-router";
import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from "framer-motion";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { BlurText } from "@/components/BlurText";
import { Magnetic } from "@/components/Magnetic";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SpotlightTilt } from "@/components/SpotlightTilt";

export const Route = createFileRoute("/")({
  component: Index,
});

const EMAIL = "info@alpine-eco.co.za";
const PHONE_DISPLAY = "011 493 0113";
const PHONE_TEL = "+27114930113";
const ADDRESS = "22 Stevens Rd, Stafford, Johannesburg, 2197, South Africa";

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
const MOTION_DURATION = 0.32;
const MOTION_LIFT = 8;
const MOTION_STAGGER = 0.06;

const NAV_LINKS = [
  ["story", "Story"],
  ["print", "The Range"],
  ["work", "How We Work"],
  ["contact", "Contact"],
] as const;

type ProductType = "notebooks" | "diaries" | "journals" | "corporate";

const PRODUCT_COLORS = {
  notebooks: {
    cover: "linear-gradient(160deg, #1A8FBE 0%, #0078A8 48%, #08648F 100%)",
    accent: "#0078A8",
    label: "Notebooks",
  },
  diaries: {
    cover: "linear-gradient(160deg, #88C868 0%, #68B848 50%, #4F8F2E 100%)",
    accent: "#68B848",
    label: "Diaries",
  },
  journals: {
    cover: "linear-gradient(160deg, #FFFEFA 0%, #F0EAE0 100%)",
    accent: "#0078A8",
    label: "Journals",
  },
  corporate: {
    cover: "linear-gradient(160deg, #EC008C 0%, #C8007A 50%, #A00060 100%)",
    accent: "#EC008C",
    label: "Corporate",
  },
} as const;

const LazyMobileNavSheet = lazy(() => import("@/components/MobileNavSheet"));
const LazyHeroNotebook = lazy(() =>
  import("@/components/MotionLayer").then((mod) => ({
    default: mod.HeroNotebookScene,
  })),
);
const LazySheetsFan = lazy(() =>
  import("@/components/MotionLayer").then((mod) => ({
    default: mod.SheetsFanScene,
  })),
);
const LazyBindingPile = lazy(() =>
  import("@/components/MotionLayer").then((mod) => ({
    default: mod.BindingPileScene,
  })),
);

type MotionMode = "idle" | "backdrop" | "full";

function resolveMotionMode(): Exclude<MotionMode, "idle"> {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData =
    "connection" in navigator &&
    Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData,
    );
  const nav = navigator as Navigator & { deviceMemory?: number };
  // Only skip 3D on very constrained devices (Chrome reports deviceMemory in GB).
  const lowEnd = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
  if (reduce || saveData || lowEnd) return "backdrop";
  return "full";
}

function scheduleIdle(cb: () => void, timeout = 500) {
  if (typeof window === "undefined") return () => {};
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const t = window.setTimeout(cb, Math.min(timeout, 160));
  return () => window.clearTimeout(t);
}

/** Defer 3D until after load so Chrome isn't busy during first paint/scroll. */
function useDeferredScenes() {
  const [mode, setMode] = useState<MotionMode>("idle");
  const [heroReady, setHeroReady] = useState(false);
  const [restReady, setRestReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cancelIdle: (() => void) | undefined;
    let cancelRest: (() => void) | undefined;

    const start = () => {
      if (cancelled) return;
      const next = resolveMotionMode();
      setMode(next);
      if (next !== "full") return;
      // Wait until the browser is quiet — never mid-scroll hitch from mounting 3D.
      cancelIdle = scheduleIdle(() => {
        if (cancelled) return;
        setHeroReady(true);
        // Static scenes are cheap — mount soon after hero, don't wait ~2s.
        cancelRest = scheduleIdle(() => {
          if (!cancelled) setRestReady(true);
        }, 200);
      }, 500);
    };

    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }

    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      cancelIdle?.();
      cancelRest?.();
      setHeroReady(false);
      setRestReady(false);
      start();
    };
    mqReduced.addEventListener("change", onChange);

    return () => {
      cancelled = true;
      cancelIdle?.();
      cancelRest?.();
      window.removeEventListener("load", start);
      mqReduced.removeEventListener("change", onChange);
    };
  }, []);

  return {
    mode,
    showHero: mode === "full" && heroReady,
    showRest: mode === "full" && restReady,
  };
}

/** Unmount heavy scenes when off-screen (Chrome compositor win). */
function useNearViewport(ref: RefObject<HTMLElement | null>, rootMargin = "15% 0px") {
  const [near, setNear] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return near;
}

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

function ColorBar({ className = "" }: { className?: string }) {
  const colors = [
    "#00AEEF",
    "#EC008C",
    "#FFF200",
    "#231F20",
    "#0078A8",
    "#68B848",
  ];
  return (
    <div className={`color-bar ${className}`} aria-hidden>
      {colors.map((c) => (
        <span key={c} style={{ background: c }} />
      ))}
    </div>
  );
}

/** Official light-background logo mark. */
function Logo({
  className = "",
  size = "nav",
}: {
  className?: string;
  size?: "nav" | "hero" | "footer";
}) {
  const sizeClass =
    size === "hero"
      ? "h-16 w-auto max-w-[300px] object-contain object-left md:h-20 md:max-w-[360px]"
      : size === "footer"
        ? "h-11 w-auto max-w-[220px] object-contain md:h-12"
        : "h-10 w-auto max-w-[200px] object-contain md:h-11";

  return (
    <a
      href="#hero"
      onClick={(e) => {
        e.preventDefault();
        scrollTo("hero");
      }}
      className={`inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-royal)] ${className}`}
      aria-label="Alpine-eco Notebooks & Diaries — home"
    >
      <picture>
        <source srcSet="/alpine-eco-logo.webp?v=3" type="image/webp" />
        <img
          src="/alpine-eco-logo.png?v=3"
          alt="Alpine-eco Notebooks & Diaries"
          className={sizeClass}
          width={360}
          height={144}
          decoding="async"
          fetchPriority={size === "hero" ? "high" : "low"}
          loading={size === "hero" ? "eager" : "lazy"}
        />
      </picture>
    </a>
  );
}

function NavLink({
  id,
  label,
  active,
  onDark,
}: {
  id: string;
  label: string;
  active?: boolean;
  onDark?: boolean;
}) {
  return (
    <a
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault();
        scrollTo(id);
      }}
      aria-current={active ? "true" : undefined}
      className={`gradient-underline text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-royal)] ${
        active
          ? onDark
            ? "text-white"
            : "text-[color:var(--color-royal)]"
          : onDark
            ? "text-white/65 hover:text-white"
            : "text-[color:var(--color-ink-2)] hover:text-[color:var(--color-royal)]"
      }`}
    >
      {label}
    </a>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 64);
        const ids = ["hero", "story", "print", "work", "contact"] as const;
        let current: string = "hero";
        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= 120) current = id;
        }
        setActive(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onDark = false;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-300 ${
        scrolled
          ? "bg-white/92 shadow-[0_1px_0_rgba(0,120,168,0.1)] backdrop-blur-md"
          : "border-b border-[rgba(0,120,168,0.08)] bg-[rgba(243,247,248,0.72)] backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 sm:px-8 lg:px-12">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map(([id, label]) => (
            <NavLink
              key={id}
              id={id}
              label={label}
              active={active === id}
              onDark={onDark}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("contact");
            }}
            className="btn-primary hidden sm:inline-flex"
            style={{ padding: "12px 22px" }}
          >
            Enquire
          </a>

          <Suspense
            fallback={
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[rgba(0,120,168,0.2)] bg-white/80 text-[color:var(--color-ink)] md:hidden"
                aria-label="Open menu"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            }
          >
            <LazyMobileNavSheet onNavigate={scrollTo} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: MOTION_LIFT },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION, ease: MOTION_EASE },
  },
} as const;

const fadeUpStatic = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
} as const;

function useRevealVariants() {
  const reduce = useReducedMotion();
  return reduce ? fadeUpStatic : fadeUp;
}

function useStaggerParent() {
  const reduce = useReducedMotion();
  return {
    show: {
      transition: { staggerChildren: reduce ? 0 : MOTION_STAGGER },
    },
  } as const;
}

function Eyebrow({
  children,
  onDark = false,
}: {
  children: React.ReactNode;
  onDark?: boolean;
}) {
  return (
    <div
      className={`eyebrow inline-flex items-center gap-2.5 ${
        onDark ? "text-[color:var(--color-eco-light)]" : ""
      }`}
    >
      <span className={`reg-cross ${onDark ? "opacity-90" : ""}`} aria-hidden />
      <span>{children}</span>
    </div>
  );
}

function RulerProgress() {
  // CSS scroll-driven when supported — avoids a Framer scroll subscription in Chrome.
  return <div className="ruler-progress-css" aria-hidden />;
}

function Hero({
  sectionRef,
  showScene,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  showScene: boolean;
}) {
  const variants = useRevealVariants();
  const stagger = useStaggerParent();
  const reduce = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="hero-band crop-marks relative scroll-mt-24 overflow-x-clip"
      style={{ minHeight: reduce ? "100dvh" : "200dvh" }}
    >
      <div className="sticky top-0 min-h-[100dvh] overflow-x-clip pt-28 pb-40 sm:pb-24 lg:pt-32 lg:pb-32">
        <div className="hero-veil" aria-hidden />
        <div className="hero-aurora" aria-hidden />
        {showScene && (
          <Suspense fallback={null}>
            <LazyHeroNotebook sectionRef={sectionRef} />
          </Suspense>
        )}

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-12 lg:px-12">
          <m.div
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={stagger}
            className="lg:col-span-5 xl:col-span-6"
          >
          <m.div variants={variants} className="flex flex-col items-start gap-4">
            <Logo size="hero" />
            <Eyebrow>Printing &amp; Book-Binding · Johannesburg</Eyebrow>
          </m.div>

          <div className="mt-6">
            <h1 className="display-title text-[color:var(--color-ink)]">
              <BlurText
                as="span"
                className="inline"
                text="Print with"
                delay={0.1}
                stagger={0.07}
              />{" "}
              <m.span
                className="ink-accent inline-block text-[color:var(--color-royal)]"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduce ? 0 : 0.35,
                  delay: reduce ? 0 : 0.35,
                  ease: MOTION_EASE,
                }}
              >
                Alpine-eco.
              </m.span>
            </h1>
          </div>

          <m.p
            variants={variants}
            className="mt-8 max-w-xl text-[clamp(1.05rem,2.2vw,1.2rem)] leading-relaxed text-[color:var(--color-body)]"
          >
            Notebooks, diaries and journals, printed and bound under one roof in Stafford.
          </m.p>
          <m.div variants={variants} className="mt-10 flex flex-wrap gap-3">
            <Magnetic>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("contact");
                }}
                className="btn-primary"
              >
                Request a quotation
              </a>
            </Magnetic>
            <Magnetic strength={0.22}>
              <a
                href="#print"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("print");
                }}
                className="btn-ghost"
              >
                The range
              </a>
            </Magnetic>
          </m.div>
          <m.div variants={variants} className="mt-12">
            <ColorBar />
          </m.div>
        </div>
      </div>
      </div>
    </section>
  );
}

function Section({
  id,
  children,
  className = "",
  sectionRef,
  deferPaint = false,
  withCrop = false,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  sectionRef?: RefObject<HTMLElement | null>;
  deferPaint?: boolean;
  withCrop?: boolean;
}) {
  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative scroll-mt-24 py-20 lg:py-28 ${withCrop ? "crop-marks" : ""} ${deferPaint ? "cv-auto" : ""} ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">{children}</div>
    </section>
  );
}

function SectionOpener({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  const variants = useRevealVariants();
  const stagger = useStaggerParent();
  return (
    <m.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={stagger}
      className="max-w-3xl"
    >
      <m.div variants={variants} className="mb-8">
        <ColorBar className="max-w-[180px]" />
      </m.div>
      <m.div variants={variants}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </m.div>
      {typeof title === "string" ? (
        <BlurText
          as="h2"
          className="section-title mt-6"
          text={title}
          trigger="view"
          stagger={0.05}
          delay={0.05}
        />
      ) : (
        <ScrollReveal className="mt-6" delay={0.05}>
          <h2 className="section-title">{title}</h2>
        </ScrollReveal>
      )}
      {children}
    </m.div>
  );
}

function Story() {
  const variants = useRevealVariants();
  const stagger = useStaggerParent();
  return (
    <Section id="story" className="pt-36 sm:pt-20 lg:pt-28">
      <div className="grid gap-16 lg:grid-cols-12">
        {/* Left cols reserved for SheetsFanScene */}
        <div className="hidden lg:col-span-5 lg:block" aria-hidden />
        <div className="lg:col-span-7">
          <SectionOpener
            eyebrow="Our Story"
            title={
              <>
                Press and{" "}
                <span className="ink-accent text-[color:var(--color-royal)]">
                  bindery,
                </span>{" "}
                under one roof.
              </>
            }
          />
        </div>
        <m.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="lg:col-span-7 lg:col-start-6 lg:pt-4"
        >
          <m.p
            variants={variants}
            className="text-[18px] leading-relaxed text-[color:var(--color-body)] md:text-[19px]"
          >
            Based in Stafford, Johannesburg, Alpine-eco runs the press and the bindery
            on site. Notebooks, diaries and journals are printed, trimmed and bound
            under one roof.
          </m.p>
          <m.p
            variants={variants}
            className="mt-5 text-[18px] leading-relaxed text-[color:var(--color-body)] md:text-[19px]"
          >
            Accurate colour, clean finishing, and binding that holds up to everyday use —
            for companies, schools, and private clients across South Africa.
          </m.p>
          <m.ul variants={variants} className="mt-10 space-y-4">
            {[
              "Litho and digital printing on site",
              "Binding and finishing in the same works",
              "Checked by hand before it leaves Stafford",
            ].map((t) => (
              <li
                key={t}
                className="flex items-start gap-3 border-t border-[rgba(0,120,168,0.14)] pt-4 text-[16px] text-[color:var(--color-ink-2)]"
              >
                <span className="reg-cross mt-1.5" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </m.ul>
        </m.div>
      </div>
    </Section>
  );
}

function WhatWePrint({ onProductChange }: { onProductChange: (product: ProductType) => void }) {
  const featured = {
    n: "01",
    title: "Notebooks",
    desc: "Soft and hard cover, ruled or dot-grid — sized for a desk, a bag, or a branded run. Printed and bound in Stafford.",
    id: "notebooks" as ProductType,
  };
  const supporting = [
    {
      n: "02",
      title: "Diaries",
      desc: "Daily and weekly planners with dated pages, printed and bound for a full year of use.",
      id: "diaries" as ProductType,
    },
    {
      n: "03",
      title: "Journals",
      desc: "Unlined and lightly ruled pages for notes, sketches and long-form writing.",
      id: "journals" as ProductType,
    },
    {
      n: "04",
      title: "Corporate & Custom",
      desc: "Branded diaries and notebooks for companies, schools, and year-end gifts.",
      id: "corporate" as ProductType,
    },
  ] as const;

  const variants = useRevealVariants();
  const stagger = useStaggerParent();
  const cardRefs = useRef<Map<ProductType, HTMLElement>>(new Map());

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            const id = entry.target.getAttribute("data-product-id") as ProductType;
            if (id) onProductChange(id);
          }
        });
      },
      { threshold: [0.4, 0.6], rootMargin: "-20% 0px" }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [onProductChange]);

  return (
    <Section id="print" withCrop>
      <m.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
        className="max-w-3xl lg:ml-[min(38%,22rem)]"
      >
        <m.div variants={variants} className="mb-8">
          <ColorBar className="max-w-[180px]" />
        </m.div>
        <m.div variants={variants}>
          <Eyebrow>The Range</Eyebrow>
        </m.div>
        <BlurText
          as="h2"
          className="section-title mt-6"
          text="Printed and bound to order."
          trigger="view"
          stagger={0.05}
          delay={0.05}
        />
        <m.p
          variants={variants}
          className="mt-6 max-w-2xl text-[18px] leading-relaxed text-[color:var(--color-body)]"
        >
          From a short personal run through to a full corporate order — notebooks,
          diaries, journals and branded work, printed and bound in Johannesburg.
        </m.p>
      </m.div>

      {/* Mobile: divided list */}
      <m.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        variants={stagger}
        className="mt-12 divide-y divide-[rgba(0,120,168,0.12)] border-y border-[rgba(0,120,168,0.12)] md:hidden"
      >
        {[featured, ...supporting].map((item) => (
          <m.a
            key={item.title}
            variants={variants}
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("contact");
            }}
            className="flex w-full items-start gap-4 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--color-royal)]"
          >
            <span className="font-serif text-[28px] leading-none tracking-tight text-[rgba(0,120,168,0.28)]">
              {item.n}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-serif text-[26px] leading-tight tracking-tight text-[color:var(--color-ink)]">
                {item.title}
              </span>
              <span className="mt-2 block text-[15px] leading-relaxed text-[color:var(--color-body)]">
                {item.desc}
              </span>
              <span className="mt-3 inline-block text-[13px] font-medium tracking-[0.02em] text-[color:var(--color-eco-deep)]">
                Request a quotation →
              </span>
            </span>
          </m.a>
        ))}
      </m.div>

      {/* Desktop: asymmetric editorial grid */}
      <m.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        variants={stagger}
        className="mt-16 hidden gap-5 md:grid md:grid-cols-12 lg:pl-[min(34%,18rem)]"
      >
        <m.div
          variants={variants}
          className="md:col-span-7 lg:col-span-7"
          ref={(el) => {
            if (el) cardRefs.current.set(featured.id, el);
          }}
          data-product-id={featured.id}
        >
          <SpotlightTilt
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("contact");
            }}
            className="product-feature h-full"
          >
            <div>
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-[56px] leading-none tracking-tight text-[rgba(0,120,168,0.16)]">
                  {featured.n}
                </span>
                <span
                  aria-hidden
                  className="h-px flex-1 bg-[rgba(0,120,168,0.12)]"
                />
              </div>
              <h3 className="mt-8 font-serif text-[42px] leading-[1.08] tracking-tight text-[color:var(--color-ink)] lg:text-[48px]">
                {featured.title}
              </h3>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[color:var(--color-body)] md:text-[17px]">
                {featured.desc}
              </p>
            </div>
            <div className="mt-12 flex items-center justify-between gap-4 border-t border-[rgba(0,120,168,0.1)] pt-5">
              <span className="text-[13px] font-medium tracking-[0.02em] text-[color:var(--color-eco-deep)]">
                Request a quotation
              </span>
              <span aria-hidden className="text-[color:var(--color-royal)]">
                →
              </span>
            </div>
          </SpotlightTilt>
        </m.div>

        <div className="flex flex-col gap-4 md:col-span-5">
          {supporting.map((item) => (
            <m.div 
              key={item.title} 
              variants={variants}
              ref={(el) => {
                if (el) cardRefs.current.set(item.id, el);
              }}
              data-product-id={item.id}
            >
              <SpotlightTilt
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("contact");
                }}
                className="product-panel"
                maxTilt={5}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-[24px] leading-none tracking-tight text-[rgba(0,120,168,0.22)]">
                    {item.n}
                  </span>
                  <h3 className="font-serif text-[24px] leading-tight tracking-tight text-[color:var(--color-ink)]">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-body)]">
                  {item.desc}
                </p>
                <span className="mt-4 inline-block text-[13px] font-medium tracking-[0.02em] text-[color:var(--color-eco-deep)]">
                  Request a quotation →
                </span>
              </SpotlightTilt>
            </m.div>
          ))}
        </div>
      </m.div>
    </Section>
  );
}

function HowWeWork({
  sectionRef,
  showScene,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  showScene: boolean;
}) {
  const steps = [
    [
      "01",
      "Print",
      "Litho and digital printing in-house — colour, registration and stock under our control.",
    ],
    [
      "02",
      "Cut",
      "Every sheet trimmed and squared before it moves to the bindery.",
    ],
    [
      "03",
      "Bind",
      "Perfect, saddle-stitch or casebound — matched to the job, not a one-size process.",
    ],
    [
      "04",
      "Finish & Check",
      "A final check, then dispatched.",
    ],
  ] as const;
  const variants = useRevealVariants();
  const stagger = useStaggerParent();
  const reduce = useReducedMotion();

  const stepDot = reduce
    ? undefined
    : ({
        hidden: { opacity: 0, scale: 0.55 },
        show: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.4, ease: MOTION_EASE },
        },
      } as const);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="scene-window-right relative scroll-mt-24 pt-36 pb-20 sm:pt-20 lg:py-28"
    >
      {showScene && (
        <Suspense fallback={null}>
          <LazyBindingPile sectionRef={sectionRef} />
        </Suspense>
      )}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-8 sm:px-8 lg:px-12 lg:pr-[min(38%,20rem)]">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="max-w-xl lg:col-span-6">
            <SectionOpener
              eyebrow="How We Work"
              title="From press to binding."
            />
          </div>
          <m.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants}
            className="max-w-xl text-[18px] leading-relaxed text-[color:var(--color-body)] lg:col-span-6 lg:col-start-1 lg:pt-4"
          >
            The press and the bindery are both on site in Stafford, so colour, trimming,
            and binding stay with us from start to finish.
          </m.p>
        </div>

        <div className="relative mt-20">
          {reduce ? (
            <div
              aria-hidden
              className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-[color:var(--color-royal)] to-[color:var(--color-eco)] opacity-35 lg:block"
            />
          ) : (
            <m.div
              aria-hidden
              className="absolute left-0 right-0 top-6 hidden h-px origin-left bg-gradient-to-r from-[color:var(--color-royal)] to-[color:var(--color-eco)] lg:block"
              initial={{ scaleX: 0, opacity: 0.15 }}
              whileInView={{ scaleX: 1, opacity: 0.4 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.75, ease: MOTION_EASE }}
            />
          )}
          <m.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map(([n, title, desc]) => (
              <m.div key={n} variants={variants} className="relative">
                {reduce ? (
                  <div
                    aria-hidden
                    className="mb-6 hidden h-3 w-3 rounded-full border border-[rgba(0,120,168,0.4)] bg-white lg:block"
                  />
                ) : (
                  <m.div
                    aria-hidden
                    variants={stepDot}
                    className="mb-6 hidden h-3 w-3 rounded-full border border-[rgba(0,120,168,0.4)] bg-white lg:block"
                  />
                )}
                <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-royal)]">
                  {n}
                </div>
                <h3 className="mt-3 font-serif text-[28px] leading-tight tracking-tight text-[color:var(--color-ink)]">
                  {title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-body)] md:text-[16px]">
                  {desc}
                </p>
              </m.div>
            ))}
          </m.div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const variants = useRevealVariants();
  const stagger = useStaggerParent();
  return (
    <Section id="contact" className="bg-[color:var(--color-cream)]">
      <m.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
        className="grid gap-12 lg:grid-cols-12"
      >
        <div className="lg:col-span-6">
          <m.div variants={variants} className="mb-8">
            <ColorBar className="max-w-[180px]" />
          </m.div>
          <m.div variants={variants}>
            <Eyebrow>Enquire</Eyebrow>
          </m.div>
          <ScrollReveal className="mt-6" delay={0.05}>
            <h2 className="section-title">Request a quotation.</h2>
          </ScrollReveal>
          <m.p
            variants={variants}
            className="mt-6 max-w-xl text-[18px] leading-relaxed text-[color:var(--color-body)]"
          >
            For corporate orders, short runs, or a custom binding. We are in Stafford,
            Johannesburg.
          </m.p>
        </div>
        <m.div
          variants={variants}
          className="flex flex-col justify-end gap-6 lg:col-span-5 lg:col-start-8"
        >
          <div className="flex flex-wrap gap-3">
            <Magnetic>
              <a href={`mailto:${EMAIL}`} className="btn-primary">
                Email us
              </a>
            </Magnetic>
            <Magnetic strength={0.22}>
              <a href={`tel:${PHONE_TEL}`} className="btn-ghost">
                Call {PHONE_DISPLAY}
              </a>
            </Magnetic>
          </div>
          <address className="not-italic text-[15px] leading-relaxed text-[color:var(--color-body)] md:text-[16px]">
            {ADDRESS}
          </address>
        </m.div>
      </m.div>
    </Section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[rgba(0,120,168,0.14)] bg-[color:var(--color-cream)] py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <ColorBar className="mb-10 max-w-[160px]" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-5">
          <Logo size="footer" />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[color:var(--color-body)] md:text-[16px]">
            Printing and book-binding in Johannesburg. Notebooks, diaries and journals
            made on site, from press to spine.
          </p>
        </div>
        <div className="lg:col-span-3 lg:col-start-7">
          <Eyebrow>Explore</Eyebrow>
          <ul className="mt-5 space-y-3 text-[15px] text-[color:var(--color-ink-2)] md:text-[16px]">
            {NAV_LINKS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(id);
                  }}
                  className="gradient-underline transition-colors hover:text-[color:var(--color-royal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-royal)]"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-3">
          <Eyebrow>Contact</Eyebrow>
          <ul className="mt-5 space-y-3 text-[15px] text-[color:var(--color-ink-2)] md:text-[16px]">
            <li>
              <a
                href={`mailto:${EMAIL}`}
                className="gradient-underline transition-colors hover:text-[color:var(--color-royal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-royal)]"
              >
                {EMAIL}
              </a>
            </li>
            <li>
              <a
                href={`tel:${PHONE_TEL}`}
                className="gradient-underline transition-colors hover:text-[color:var(--color-royal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--color-royal)]"
              >
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <address className="not-italic leading-relaxed text-[color:var(--color-body)]">
                {ADDRESS}
              </address>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-7xl border-t border-[rgba(0,120,168,0.10)] px-6 pt-8 sm:px-8 lg:px-12">
        <p className="text-[13px] leading-relaxed tracking-wide text-[color:var(--color-body)]">
          Printed &amp; bound in Johannesburg · © {year} Alpine-eco Notebooks &amp;
          Diaries
        </p>
        <div className="mt-6">
          <ColorBar className="max-w-[120px]" />
        </div>
      </div>
    </footer>
  );
}

function Index() {
  const heroRef = useRef<HTMLElement | null>(null);
  const sheetsRef = useRef<HTMLDivElement | null>(null);
  const workRef = useRef<HTMLElement | null>(null);
  const { showHero, showRest } = useDeferredScenes();
  const heroNear = useNearViewport(heroRef, "30% 0px");
  const [activeProduct, setActiveProduct] = useState<ProductType>("notebooks");

  return (
    <SmoothScroll>
      <LazyMotion features={domAnimation}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="site-backdrop" aria-hidden />
        {/* Desktop-only paper grain — CSS already hides below 768px */}
        <div className="site-grain hidden md:block" aria-hidden />
        <div className="relative z-10 min-h-[100dvh] overflow-x-clip bg-transparent">
          <RulerProgress />
          <Nav />
          <main id="main-content">
          <Hero sectionRef={heroRef} showScene={showHero && heroNear} />
          <div ref={sheetsRef} className="scene-window-left relative">
            {showRest && (
              <Suspense fallback={null}>
                <LazySheetsFan sectionRef={sheetsRef} product={PRODUCT_COLORS[activeProduct]} />
              </Suspense>
            )}
            <div className="relative z-10">
              <Story />
              <WhatWePrint onProductChange={setActiveProduct} />
            </div>
          </div>
          <HowWeWork sectionRef={workRef} showScene={showRest} />
          <CTA />
        </main>
        <Footer />
      </div>
    </LazyMotion>
    </SmoothScroll>
  );
}
