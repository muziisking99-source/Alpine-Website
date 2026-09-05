import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  ["story", "Story"],
  ["print", "What We Print"],
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

export function MobileNavSheet({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-[rgba(0,120,168,0.2)] bg-white/80 text-[color:var(--color-ink)] md:hidden"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100%,320px)] border-l border-[rgba(0,120,168,0.14)] bg-[color:var(--color-cream)] p-0"
      >
        <SheetHeader className="border-b border-[rgba(0,120,168,0.1)] px-6 py-5 text-left">
          <SheetTitle className="font-serif text-2xl font-medium tracking-tight text-[color:var(--color-ink)]">
            Menu
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
          {NAV_LINKS.map(([id, label]) => (
            <SheetClose asChild key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(id);
                  setOpen(false);
                }}
                className="rounded-[4px] px-3 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-ink-2)] hover:bg-white/70 hover:text-[color:var(--color-royal)]"
              >
                {label}
              </a>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("contact");
                setOpen(false);
              }}
              className="btn-primary mt-4"
            >
              Get In Touch
            </a>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNavSheet;
