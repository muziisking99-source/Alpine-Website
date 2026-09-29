import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const NAV_LINKS = [
  ["story", "Story"],
  ["print", "The Range"],
  ["work", "How We Work"],
  ["contact", "Contact"],
] as const;

function MenuIcon() {
  return (
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
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/**
 * Lightweight mobile drawer — no Radix/lucide (keeps Vite cold start lean).
 */
export function MobileNavSheet({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  const go = (id: string) => {
    onNavigate(id);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-[rgba(0,120,168,0.2)] bg-white/80 text-[color:var(--color-ink)] md:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] md:hidden" role="presentation">
            <button
              type="button"
              className="absolute inset-0 bg-[rgba(15,35,45,0.45)]"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div
              ref={panelRef}
              id={dialogId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="absolute inset-y-0 right-0 flex w-[min(100%,320px)] flex-col border-l border-[rgba(0,120,168,0.14)] bg-[color:var(--color-cream)] shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[rgba(0,120,168,0.1)] px-6 py-5">
                <h2
                  id={titleId}
                  className="font-serif text-2xl font-medium tracking-tight text-[color:var(--color-ink)]"
                >
                  Menu
                </h2>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] text-[color:var(--color-ink)] hover:bg-white/70"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
                {NAV_LINKS.map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(id);
                    }}
                    className="rounded-[4px] px-3 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-ink-2)] hover:bg-white/70 hover:text-[color:var(--color-royal)]"
                  >
                    {label}
                  </a>
                ))}
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    go("contact");
                  }}
                  className="btn-primary mt-4"
                >
                  Enquire
                </a>
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default MobileNavSheet;
