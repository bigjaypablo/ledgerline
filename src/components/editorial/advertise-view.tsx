import { useState } from "react";
import { PublicShell } from "@/components/editorial/shell";
import { submitContact } from "@/lib/editorial/public";

const PRICE = "Contact us for pricing";
const X_URL = "https://x.com/0xNormadOnChain";

const PACKAGES = [
  {
    id: "Sponsored listing",
    text: "Your project in the On the radar strip on /opportunities for 30 days, labelled Sponsored.",
  },
  {
    id: "Featured guide",
    text: "A fully researched guide page for your campaign, labelled Sponsored.",
  },
  {
    id: "Verification check",
    text: "We verify your campaign details and publish what we find. The fee covers the work, not the result.",
  },
  {
    id: "Newsletter slot",
    text: "One clearly marked sponsor line in a desk note.",
  },
] as const;

const RULES = [
  "Paid placement never changes a status, a risk note or a verification result.",
  "Every paid item is labelled Sponsored.",
  "We decline projects we cannot verify or that look like scams.",
  "We do not guarantee rewards, traffic or returns.",
  "Payment is taken before publishing. Refunds apply only if work has not started.",
];

const box = "mt-1 min-h-12 w-full border border-line bg-card px-3 text-base";

export function AdvertiseView() {
  const [f, setF] = useState({
    name: "",
    email: "",
    project: "",
    link: "",
    pack: PACKAGES[0].id as string,
    budget: "",
    note: "",
    company: "",
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: e.target.value });

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const body = [
      "[ADVERTISE ENQUIRY]",
      "Package: " + f.pack,
      "Project: " + f.project,
      "Link: " + f.link,
      "Budget: " + (f.budget || "not stated"),
      "",
      f.note,
    ].join("\n");
    try {
      const r = await submitContact({
        data: { name: f.name, email: f.email, message: body, company: f.company },
      });
      setMsg(r.ok ? "Received. We will reply to the email you gave." : r.message);
    } catch {
      setMsg("Could not send that. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <main className="sheet py-8 font-sans">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold tracking-widest text-accent uppercase">
            Advertise
          </p>
          <h1 className="mt-2 text-4xl font-medium">Work with Ledgerline</h1>
          <p className="mt-3 text-lg leading-7 text-muted">
            Reach readers who check before they act. Paid work is always
            labelled and never buys a better verdict.
          </p>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {PACKAGES.map((p) => (
              <li key={p.id} className="border border-line bg-card p-4">
                <h2 className="text-lg font-semibold">{p.id}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{p.text}</p>
                <p className="mt-3 text-sm font-semibold">{PRICE}</p>
              </li>
            ))}
          </ul>
          <section className="mt-8">
            <h2 className="text-2xl font-medium">Our rules</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-base leading-7">
              {RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
          <section className="mt-8">
            <h2 className="text-2xl font-medium">Start an enquiry</h2>
            <form onSubmit={send} className="mt-3 space-y-3">
              <label className="block text-sm font-semibold">
                Your name
                <input required className={box} value={f.name} onChange={set("name")} />
              </label>
              <label className="block text-sm font-semibold">
                Email
                <input required type="email" className={box} value={f.email} onChange={set("email")} />
              </label>
              <label className="block text-sm font-semibold">
                Project name
                <input required className={box} value={f.project} onChange={set("project")} />
              </label>
              <label className="block text-sm font-semibold">
                Project link (https://)
                <input required className={box} value={f.link} onChange={set("link")} />
              </label>
              <label className="block text-sm font-semibold">
                Package
                <select className={box} value={f.pack} onChange={set("pack")}>
                  {PACKAGES.map((p) => (
                    <option key={p.id}>{p.id}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Budget (optional)
                <input className={box} value={f.budget} onChange={set("budget")} />
              </label>
              <label className="block text-sm font-semibold">
                What should we know?
                <textarea
                  required
                  minLength={12}
                  className={box + " min-h-28 py-2"}
                  value={f.note}
                  onChange={set("note")}
                />
              </label>
              <label className="absolute -left-[9999px]" aria-hidden="true">
                Company
                <input tabIndex={-1} autoComplete="off" value={f.company} onChange={set("company")} />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="min-h-12 w-full bg-ink text-sm font-semibold text-inverse-fg disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send enquiry"}
              </button>
              {msg ? <p className="text-sm">{msg}</p> : null}
            </form>
            <p className="mt-4 text-sm text-muted">
              Prefer X? Message{" "}
              <a href={X_URL} target="_blank" rel="noopener noreferrer" className="underline">
                @0xNormadOnChain
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </PublicShell>
  );
}
