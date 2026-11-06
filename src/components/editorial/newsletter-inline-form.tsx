import { useState } from "react";
import { subscribe } from "@/lib/editorial/public";

export function NewsletterInlineForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const result = await subscribe({ data: { email, consent: true, company } });
      setMessage(result.message);
      if (result.ok) {
        setEmail("");
        setDone(true);
      }
    } catch {
      setMessage("Could not save that address. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} id="desk-note" className="w-full">
      <label className="sr-only" htmlFor="band-email">
        Email address
      </label>
      <div className="relative">
        <input
          id="band-email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-14 w-full border border-inverse-fg/40 bg-transparent pr-32 pl-4 text-base text-inverse-fg placeholder:text-inverse-fg/60"
        />
        <button
          type="submit"
          disabled={pending}
          className="absolute top-1.5 right-1.5 bottom-1.5 bg-accent px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Subscribe"}
        </button>
      </div>
      <label className="absolute -left-[9999px]" aria-hidden="true">
        Company
        <input value={company} onChange={(event) => setCompany(event.target.value)} tabIndex={-1} autoComplete="off" />
      </label>
      <p className="mt-3 text-xs leading-5 text-inverse-fg/70">
        By subscribing you agree to receive the occasional desk note. Unsubscribe anytime.
      </p>
      {message ? (
        <p className={`mt-2 text-sm font-semibold ${done ? "" : "text-accent"}`} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
