import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  deskOverview,
  exportSubscribers,
  listAdminArticles,
  listAffiliates,
  listCommentsAdmin,
  listMessages,
  listProfiles,
  listSubscribers,
  moderateComment,
  saveAffiliate,
  saveProfile,
  saveSettings,
  getSettingsAdmin,
  claimStaff,
} from "@/lib/editorial/admin";
import { formatDate } from "@/lib/editorial/text";

const links = [
  ["/admin", "Home"],
  ["/admin/articles", "Posts"],
  ["/admin/media", "Media"],
  ["/admin/pages", "Pages"],
  ["/admin/comments", "Comments"],
  ["/admin/subscribers", "Subscribers"],
  ["/admin/affiliates", "Affiliates"],
  ["/admin/messages", "Messages"],
  ["/admin/settings", "People"],
] as const;

export function DeskLayout() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  if (path === "/admin/login") return <Outlet />;
  return <StaffFrame />;
}

function StaffFrame() {
  const { user, isPending } = useCurrentUserState();
  const [access, setAccess] = useState<"pending" | "staff" | "reader">("pending");

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    claimStaff()
      .then((result) => {
        if (live) setAccess(result.ok ? "staff" : "reader");
      })
      .catch(() => {
        if (live) setAccess("reader");
      });
    return () => {
      live = false;
    };
  }, [user?.id]);

  if (isPending || (user && access === "pending")) {
    return (
      <main className="min-h-screen bg-paper px-4 py-8 text-ink">
        <p className="font-serif text-3xl">Ledgerline Desk</p>
        <p className="mt-2 text-sm text-muted">Checking the session…</p>
      </main>
    );
  }
  if (!user) return <RedirectToSignIn to="/admin/login" />;
  if (access === "reader") {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
        <div className="max-w-md border border-line bg-card p-6">
          <h1 className="font-serif text-3xl font-semibold">Staff only</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            This sign-in is a reader account. It cannot open the desk. An admin can change the role under People.
          </p>
          <Link to="/account" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-accent">
            Your account
          </Link>
        </div>
      </main>
    );
  }
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink bg-card">
        <div className="sheet flex items-center justify-between py-3">
          <Link to="/admin" className="font-serif text-2xl font-semibold">
            Ledgerline Desk
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link to="/">View site</Link>
            <UserButton />
          </div>
        </div>
        <nav className="sheet flex gap-4 overflow-x-auto text-sm font-semibold" aria-label="Desk">
          {links.map(([href, label]) => (
            <Link key={href} to={href} className="inline-flex min-h-11 shrink-0 items-center">
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="sheet py-6">
        <Outlet />
      </div>
    </div>
  );
}

function useLoad<T>(loader: () => Promise<T>) {
  const { user } = useCurrentUserState();
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    loaderRef
      .current()
      .then((value) => {
        if (live) setData(value);
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Could not load the desk.");
      });
    return () => {
      live = false;
    };
  }, [user?.id]);
  return {
    data,
    error,
    reload: () =>
      loaderRef
        .current()
        .then((value) => {
          setData(value);
          return value;
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Could not load.");
          throw err;
        }),
  };
}

export function DeskHome() {
  const { data, error } = useLoad(() => deskOverview());
  if (error) return <p className="text-accent">{error}</p>;
  if (!data) return <p className="text-muted">Loading the desk…</p>;
  return (
    <main>
      <h1 className="font-serif text-4xl font-semibold">Overview</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Signed in as {data.profile.displayName} ({data.profile.role}). Public pages only read published
        articles. Drafts are not in search or the sitemap. The browser does not query the database directly.
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="Published" value={data.counts.published} />
        <Stat label="Drafts" value={data.counts.drafts} />
        <Stat label="In review" value={data.counts.review} />
        <Stat label="Subscribers" value={data.counts.subscribers} />
        <Stat label="Pending comments" value={data.counts.pendingComments} />
        <Stat label="Unread messages" value={data.counts.messages} />
      </dl>
      <h2 className="mt-10 font-serif text-2xl font-semibold">Launch checklist</h2>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {data.checklist.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 py-3 text-sm">
            <span>
              {item.label}
              {"note" in item && item.note ? <span className="mt-1 block text-muted">{item.note}</span> : null}
              {!item.required ? <span className="mt-1 block text-muted">Optional</span> : null}
            </span>
            <span className={item.done ? "font-semibold" : "font-semibold text-accent"}>{item.done ? "Done" : "Open"}</span>
          </li>
        ))}
      </ul>
      <Link to="/admin/articles/new" className="mt-6 inline-flex min-h-11 items-center bg-ink px-4 text-sm font-semibold text-inverse-fg">
        New article
      </Link>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="border border-line bg-card p-4">
      <dt className="text-xs font-bold tracking-widest uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-serif text-3xl">{value === null ? "—" : value}</dd>
    </div>
  );
}

export function ArticleList() {
  const { user } = useCurrentUserState();
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAdminArticles>> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    listAdminArticles({ data: { status, category, q } })
      .then((value) => {
        if (live) setRows(value);
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Could not list articles.");
      });
    return () => {
      live = false;
    };
  }, [user?.id, status, category, q]);

  return (
    <main>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-4xl font-semibold">Posts</h1>
        <Link to="/admin/articles/new" className="inline-flex min-h-11 items-center bg-ink px-3 text-sm font-semibold text-inverse-fg">
          New
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 border border-line bg-card px-2" aria-label="Status">
          {["all", "draft", "review", "published", "archived"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-11 border border-line bg-card px-2" aria-label="Category">
          {["all", "crypto", "ai", "saas", "guides", "comparisons", "research"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search titles" className="min-h-11 border border-line bg-card px-3" aria-label="Search titles" />
      </div>
      {error ? <p className="mt-4 text-accent">{error}</p> : null}
      <ul className="mt-4 divide-y divide-line border-t border-line">
        {(rows ?? []).map((row) => (
          <li key={row.id} className="py-3">
            <Link to="/admin/articles/$articleId" params={{ articleId: row.id }} className="font-serif text-2xl font-semibold">
              {row.title || "Untitled"}
            </Link>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              {row.status} · {row.categorySlug} · {row.authorName} · {formatDate(row.updatedAt)}
            </p>
          </li>
        ))}
      </ul>
      {rows && rows.length === 0 ? <p className="mt-4 text-muted">No articles in this filter.</p> : null}
    </main>
  );
}

export function AffiliateDesk() {
  const { data, error, reload } = useLoad(() => listAffiliates());
  const blank = {
    id: "",
    name: "",
    category: "",
    website: "",
    affiliateUrl: "",
    programName: "",
    commissionNotes: "",
    commissionType: "undocumented",
    cookieNotes: "",
    eligibility: "",
    approvalStatus: "not_applied",
    notes: "",
    lastVerified: "",
    active: false,
  };
  const [form, setForm] = useState(blank);
  const [note, setNote] = useState("");
  if (error) return <p className="text-accent">{error}</p>;
  if (!data) return <p>Loading affiliate records…</p>;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      await saveAffiliate({ data: form });
      setNote("Saved. A record is public only when it is approved, active, and has a destination URL.");
      setForm(blank);
      await reload();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <main>
      <h1 className="font-serif text-4xl font-semibold">Affiliates</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Nothing here is shown to readers until status is approved, the record is active, and an affiliate URL is
        set. Do not invent a commission rate.
      </p>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {data.map((row) => (
          <li key={row.id} className="py-3 text-sm">
            <button type="button" className="font-semibold" onClick={() => setForm(row)}>
              {row.name}
            </button>
            <p className="text-muted">
              {row.approvalStatus} · {row.active ? "active" : "inactive"} · {row.clicks} clicks
            </p>
          </li>
        ))}
        {data.length === 0 ? <li className="py-3 text-muted">No programs yet.</li> : null}
      </ul>
      <form onSubmit={save} className="mt-6 grid gap-3 md:grid-cols-2">
        <Field label="Product or company" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Field label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} />
        <Field label="Official website" value={form.website} onChange={(website) => setForm({ ...form, website })} />
        <Field label="Affiliate URL" value={form.affiliateUrl} onChange={(affiliateUrl) => setForm({ ...form, affiliateUrl })} />
        <Field label="Program name" value={form.programName} onChange={(programName) => setForm({ ...form, programName })} />
        <label className="text-sm font-semibold">
          Commission type
          <select className="mt-1 min-h-11 w-full border border-line bg-card px-2" value={form.commissionType} onChange={(event) => setForm({ ...form, commissionType: event.target.value })}>
            <option value="undocumented">Undocumented</option>
            <option value="one-time">One-time, from program docs</option>
            <option value="recurring">Recurring, from program docs</option>
          </select>
        </label>
        <Field label="Commission notes" value={form.commissionNotes} onChange={(commissionNotes) => setForm({ ...form, commissionNotes })} />
        <Field label="Cookie notes" value={form.cookieNotes} onChange={(cookieNotes) => setForm({ ...form, cookieNotes })} />
        <Field label="Eligibility" value={form.eligibility} onChange={(eligibility) => setForm({ ...form, eligibility })} />
        <label className="text-sm font-semibold">
          Approval
          <select className="mt-1 min-h-11 w-full border border-line bg-card px-2" value={form.approvalStatus} onChange={(event) => setForm({ ...form, approvalStatus: event.target.value })}>
            {["not_applied", "pending", "approved", "rejected", "inactive"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <Field label="Last verified" value={form.lastVerified} onChange={(lastVerified) => setForm({ ...form, lastVerified })} type="date" />
        <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
          <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
          Active (only sticks if approval is approved)
        </label>
        <label className="text-sm font-semibold md:col-span-2">
          Notes
          <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-1 min-h-24 w-full border border-line bg-card px-3 py-2" />
        </label>
        <button type="submit" className="min-h-11 bg-ink px-4 text-sm font-semibold text-inverse-fg md:col-span-2">
          Save record
        </button>
        {note ? <p className="text-sm md:col-span-2">{note}</p> : null}
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full border border-line bg-card px-3" />
    </label>
  );
}

export function SubscriberDesk() {
  const { data, error } = useLoad(() => listSubscribers());
  if (error) return <p className="text-accent">{error}</p>;
  if (!data) return <p>Loading subscribers…</p>;
  return (
    <main>
      <h1 className="font-serif text-4xl font-semibold">Subscribers</h1>
      <p className="mt-2 text-sm text-muted">{data.length} stored addresses. Writers cannot open this list.</p>
      <button
        type="button"
        className="mt-4 min-h-11 border border-ink px-4 text-sm font-semibold"
        onClick={() => {
          void exportSubscribers().then((result) => {
            const blob = new Blob([result.csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "ledgerline-subscribers.csv";
            anchor.click();
            URL.revokeObjectURL(url);
          });
        }}
      >
        Export CSV
      </button>
      <ul className="mt-4 divide-y divide-line border-t border-line text-sm">
        {data.map((row) => (
          <li key={row.email} className="flex justify-between gap-3 py-2">
            <span>{row.email}</span>
            <span className="text-muted">{row.status}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function CommentDesk() {
  const { data, error, reload } = useLoad(() => listCommentsAdmin());
  if (error) return <p className="text-accent">{error}</p>;
  if (!data) return <p>Loading comments…</p>;
  return (
    <main>
      <h1 className="font-serif text-4xl font-semibold">Comments</h1>
      <ul className="mt-4 space-y-4">
        {data.map((row) => (
          <li key={row.id} className="border border-line bg-card p-4">
            <p className="text-xs font-bold tracking-widest uppercase text-muted">
              {row.status} · {row.title}
            </p>
            <p className="mt-2 text-sm font-semibold">{row.authorName}</p>
            <p className="mt-1 whitespace-pre-wrap">{row.body}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="min-h-11 border border-ink px-3 text-sm" onClick={() => void moderateComment({ data: { id: row.id, status: "approved" } }).then(() => reload())}>
                Approve
              </button>
              <button type="button" className="min-h-11 border border-line px-3 text-sm" onClick={() => void moderateComment({ data: { id: row.id, status: "rejected" } }).then(() => reload())}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {data.length === 0 ? <li className="text-muted">No comments yet.</li> : null}
      </ul>
    </main>
  );
}

export function MessageDesk() {
  const { data, error } = useLoad(() => listMessages());
  if (error) return <p className="text-accent">{error}</p>;
  if (!data) return <p>Loading messages…</p>;
  return (
    <main>
      <h1 className="font-serif text-4xl font-semibold">Messages</h1>
      <ul className="mt-4 space-y-4">
        {data.map((row) => (
          <li key={row.id} className="border-t border-line pt-3">
            <p className="text-sm font-semibold">
              {row.name} · {row.email}
            </p>
            <p className="text-xs text-muted">{formatDate(row.createdAt)}</p>
            <p className="mt-2 whitespace-pre-wrap">{row.message}</p>
          </li>
        ))}
        {data.length === 0 ? <li className="text-muted">No messages.</li> : null}
      </ul>
    </main>
  );
}

export function SettingsDesk() {
  const navigate = useNavigate();
  const { data, error } = useLoad(() => Promise.all([getSettingsAdmin(), listProfiles()]));
  const [note, setNote] = useState("");
  if (error) return <p className="text-accent">{error}</p>;
  if (!data) return <p>Loading settings…</p>;
  const [settings, people] = data;
  return (
    <SettingsForm
      initial={settings}
      people={people.people}
      selfId={people.self.userId}
      onNote={setNote}
      note={note}
      onOpenSite={() => void navigate({ to: "/" })}
    />
  );
}

function SettingsForm({
  initial,
  people,
  selfId,
  note,
  onNote,
}: {
  initial: Awaited<ReturnType<typeof getSettingsAdmin>>;
  people: Awaited<ReturnType<typeof listProfiles>>["people"];
  selfId: string;
  note: string;
  onNote: (value: string) => void;
  onOpenSite: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [profile, setProfile] = useState(people.find((person) => person.userId === selfId) ?? people[0]);
  return (
    <main className="space-y-8">
      <section>
        <h1 className="font-serif text-4xl font-semibold">Settings and people</h1>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void saveSettings({ data: form })
              .then(() => onNote("Settings saved."))
              .catch((err: unknown) => onNote(err instanceof Error ? err.message : "Could not save."));
          }}
        >
          <Field label="Tagline" value={form.tagline} onChange={(tagline) => setForm({ ...form, tagline })} />
          <Field label="Contact email" value={form.contactEmail} onChange={(contactEmail) => setForm({ ...form, contactEmail })} />
          <Field label="Public site URL" value={form.publicUrl} onChange={(publicUrl) => setForm({ ...form, publicUrl })} />
          <Field label="X profile URL" value={form.xUrl} onChange={(xUrl) => setForm({ ...form, xUrl })} />
          <Field label="Desk byline" value={form.authorName} onChange={(authorName) => setForm({ ...form, authorName })} />
          <label className="text-sm font-semibold">
            Desk biography
            <textarea value={form.authorBio} onChange={(event) => setForm({ ...form, authorBio: event.target.value })} className="mt-1 min-h-28 w-full border border-line bg-card px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.commentsEnabled} onChange={(event) => setForm({ ...form, commentsEnabled: event.target.checked })} />
            Comments open, still moderated
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.newsletterConfigured} onChange={(event) => setForm({ ...form, newsletterConfigured: event.target.checked })} />
            Newsletter provider is configured (does not send mail by itself)
          </label>
          <button type="submit" className="min-h-11 bg-ink px-4 text-sm font-semibold text-inverse-fg">
            Save settings
          </button>
        </form>
      </section>
      {profile ? (
        <section>
          <h2 className="font-serif text-2xl font-semibold">People</h2>
          <p className="mt-2 text-sm text-muted">
            Public sign-in creates a reader. Only an admin can make that person a writer, editor, or admin. The first
            staff account is created on the staff sign-in page, and only while no admin exists.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {people.map((person) => (
              <li key={person.userId}>
                <button type="button" className="font-semibold" onClick={() => setProfile(person)}>
                  {person.displayName} · {person.role}
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-4 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void saveProfile({ data: profile })
                .then(() => onNote("Profile saved."))
                .catch((err: unknown) => onNote(err instanceof Error ? err.message : "Could not save profile."));
            }}
          >
            <Field label="Display name" value={profile.displayName} onChange={(displayName) => setProfile({ ...profile, displayName })} />
            <label className="text-sm font-semibold">
              Biography
              <textarea value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} className="mt-1 min-h-24 w-full border border-line bg-card px-3 py-2" />
            </label>
            <Field label="X handle" value={profile.xHandle} onChange={(xHandle) => setProfile({ ...profile, xHandle })} />
            <Field label="X URL" value={profile.xUrl} onChange={(xUrl) => setProfile({ ...profile, xUrl })} />
            <label className="text-sm font-semibold">
              Role
              <select className="mt-1 min-h-11 w-full border border-line bg-card px-2" value={profile.role} onChange={(event) => setProfile({ ...profile, role: event.target.value as typeof profile.role })}>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="writer">Writer</option>
                <option value="reader">Reader</option>
              </select>
            </label>
            <button type="submit" className="min-h-11 border border-ink px-4 text-sm font-semibold">
              Save person
            </button>
          </form>
        </section>
      ) : null}
      {note ? <p className="text-sm">{note}</p> : null}
    </main>
  );
}

const pages = [
  ["/", "Home"],
  ["/archive", "Archive"],
  ["/crypto", "Crypto"],
  ["/ai", "AI"],
  ["/saas", "SaaS"],
  ["/guides", "Guides"],
  ["/comparisons", "Comparisons"],
  ["/research", "Research"],
  ["/about", "About"],
  ["/standards", "Editorial standards"],
  ["/corrections", "Corrections"],
  ["/disclosure", "Affiliate disclosure"],
  ["/disclaimer", "Research disclaimer"],
  ["/contact", "Contact"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
] as const;

export function PagesDesk() {
  return (
    <main>
      <h1 className="font-serif text-4xl font-semibold">Pages</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        These are publication pages, not posts. Standards, disclosures, and the legal pages stay as written pages.
        Research itself is edited under Posts.
      </p>
      <ul className="mt-4 divide-y divide-line border-t border-line">
        {pages.map(([href, label]) => (
          <li key={href} className="flex items-center justify-between gap-3 py-3">
            <span className="font-semibold">{label}</span>
            <a href={href} className="text-sm font-semibold text-accent">
              View
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function MediaDesk() {
  const { data, error } = useLoad(() => listAdminArticles({ data: { status: "all", category: "all", q: "" } }));
  if (error) return <p className="text-accent">{error}</p>;
  if (!data) return <p>Loading media…</p>;
  const images = data.filter((row) => row.coverImage);
  return (
    <main>
      <h1 className="font-serif text-4xl font-semibold">Media</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Cover images attached to posts. Upload a new one from the post editor. Alt text is required before a covered
        article can be published.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((row) => (
          <li key={row.id} className="border border-line bg-card">
            <img src={row.coverImage} alt={row.coverAlt || ""} className="aspect-[3/2] w-full object-cover" />
            <div className="p-3">
              <Link to="/admin/articles/$articleId" params={{ articleId: row.id }} className="font-semibold">
                {row.title || "Untitled"}
              </Link>
              <p className="mt-1 text-sm text-muted">{row.coverAlt || "No alt text"}</p>
            </div>
          </li>
        ))}
      </ul>
      {images.length === 0 ? <p className="mt-4 text-muted">No covers yet.</p> : null}
    </main>
  );
}
