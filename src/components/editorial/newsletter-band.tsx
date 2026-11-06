import { NewsletterInlineForm } from "@/components/editorial/newsletter-inline-form";

export function NewsletterBand({ xUrl = "" }: { xUrl?: string }) {
  return (
    <section className="bg-ink text-inverse-fg" aria-labelledby="band-title">
      <div className="sheet grid gap-8 py-12 md:grid-cols-2 md:items-center md:gap-12 md:py-16">
        <div>
          <p className="text-xs font-bold tracking-widest text-accent uppercase">The desk note</p>
          <h2 id="band-title" className="mt-3 font-serif text-3xl leading-tight font-semibold sm:text-4xl">
            Verified airdrops and crypto research, in your inbox.
          </h2>
          <p className="mt-3 max-w-md text-base leading-7 text-inverse-fg/80">
            Occasional notes on new opportunities we have checked, and the risks worth knowing. Not a product blast.
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
