import { NewsletterInlineForm } from "@/components/editorial/newsletter-inline-form";

export function NewsletterBand({ xUrl = "" }: { xUrl?: string }) {
  return (
    <section
      className="bg-[#14110f] bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(14,12,11,0.82), rgba(14,12,11,0.82)), url(/newsletter-bg.jpg)",
      }}
      aria-labelledby="band-title"
    >
      <div className="sheet grid gap-8 py-14 md:grid-cols-2 md:items-center md:gap-12 md:py-20">
        <div>
          <p className="text-xs font-bold tracking-widest text-accent uppercase">The desk note</p>
          <h2 id="band-title" className="mt-3 font-serif text-3xl leading-tight font-semibold sm:text-4xl">
            Before you spend a weekend on an airdrop, let us check it first.
          </h2>
          <p className="mt-3 max-w-md text-base leading-7 text-white/80">
            We read the official pages, check the deadlines and flag what could go wrong. When something is worth
            your time, you get one short email. That's it.
          </p>
          {xUrl ? (
            <p className="mt-4 text-sm">
              <a href={xUrl} className="font-semibold text-accent underline" rel="noopener noreferrer">
                Follow Ledgerline on X
              </a>
            </p>
          ) : null}
        </div>
        <NewsletterInlineForm />
      </div>
    </section>
  );
}
