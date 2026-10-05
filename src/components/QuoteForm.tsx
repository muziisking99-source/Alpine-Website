import { m, useReducedMotion } from "framer-motion";
import { useState, type FormEvent } from "react";

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export function QuoteForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    product: "notebooks",
    quantity: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const reduce = useReducedMotion();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const subject = `Quotation Request: ${formData.product}`;
    const body = `Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Product: ${formData.product}
Quantity: ${formData.quantity}

Message:
${formData.message}`;

    const mailtoLink = `mailto:info@alpine-eco.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <m.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-[rgba(104,184,72,0.3)] bg-[rgba(104,184,72,0.08)] p-6 text-center"
      >
        <div className="mb-2 text-2xl">✓</div>
        <p className="font-medium text-[color:var(--color-ink)]">
          Opening your email client...
        </p>
        <p className="mt-2 text-sm text-[color:var(--color-body)]">
          If it doesn't open automatically, email us at info@alpine-eco.co.za
        </p>
      </m.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-[color:var(--color-ink-2)]">
            Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-md border border-[rgba(0,120,168,0.2)] bg-white/90 px-4 py-3 text-[15px] text-[color:var(--color-ink)] transition-colors focus:border-[color:var(--color-royal)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-royal)] focus:ring-opacity-20"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-[color:var(--color-ink-2)]">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-md border border-[rgba(0,120,168,0.2)] bg-white/90 px-4 py-3 text-[15px] text-[color:var(--color-ink)] transition-colors focus:border-[color:var(--color-royal)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-royal)] focus:ring-opacity-20"
          />
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[color:var(--color-ink-2)]">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-md border border-[rgba(0,120,168,0.2)] bg-white/90 px-4 py-3 text-[15px] text-[color:var(--color-ink)] transition-colors focus:border-[color:var(--color-royal)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-royal)] focus:ring-opacity-20"
          />
        </div>
        <div>
          <label htmlFor="product" className="mb-2 block text-sm font-medium text-[color:var(--color-ink-2)]">
            Product Type *
          </label>
          <select
            id="product"
            required
            value={formData.product}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            className="w-full rounded-md border border-[rgba(0,120,168,0.2)] bg-white/90 px-4 py-3 text-[15px] text-[color:var(--color-ink)] transition-colors focus:border-[color:var(--color-royal)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-royal)] focus:ring-opacity-20"
          >
            <option value="notebooks">Notebooks</option>
            <option value="diaries">Diaries</option>
            <option value="journals">Journals</option>
            <option value="corporate">Corporate & Custom</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-[color:var(--color-ink-2)]">
          Estimated Quantity *
        </label>
        <input
          id="quantity"
          type="text"
          required
          placeholder="e.g. 100 units"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          className="w-full rounded-md border border-[rgba(0,120,168,0.2)] bg-white/90 px-4 py-3 text-[15px] text-[color:var(--color-ink)] transition-colors focus:border-[color:var(--color-royal)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-royal)] focus:ring-opacity-20"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-[color:var(--color-ink-2)]">
          Additional Details
        </label>
        <textarea
          id="message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Cover type, ruling, custom branding, delivery timeline..."
          className="w-full rounded-md border border-[rgba(0,120,168,0.2)] bg-white/90 px-4 py-3 text-[15px] text-[color:var(--color-ink)] transition-colors focus:border-[color:var(--color-royal)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-royal)] focus:ring-opacity-20"
        />
      </div>

      <button
        type="submit"
        className="btn-primary w-full sm:w-auto"
      >
        Request Quotation
      </button>
      
      <p className="text-sm text-[color:var(--color-body)]">
        * Required fields
      </p>
    </form>
  );
}
