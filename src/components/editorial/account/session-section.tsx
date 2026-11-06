import { signOut } from "@/lib/auth/client";
import { Card } from "./card";
import { DeleteAccount } from "./delete-account";

export function SessionSection() {
  return (
    <div className="grid gap-6">
    <Card title="Sign out">
      <p className="text-sm text-muted">You will be returned to the homepage.</p>
      <button
        type="button"
        className="mt-4 min-h-11 border border-ink px-4 text-sm font-semibold"
        onClick={() => void signOut("/")}
      >
        Sign out
      </button>
    </Card>
    <DeleteAccount />
    </div>
  );
}
