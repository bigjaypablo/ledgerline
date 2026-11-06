import { AvatarPicker } from "@/components/editorial/avatar-upload";
import { Card } from "./card";

export function ProfileSection({ name, email }: { name: string; email: string }) {
  return (
    <Card title="Profile">
      <AvatarPicker name={name} />
      <dl className="mt-6 grid gap-3 text-sm">
        <div>
          <dt className="text-xs font-bold tracking-widest text-muted uppercase">Name</dt>
          <dd className="mt-1 font-semibold">{name}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold tracking-widest text-muted uppercase">Email</dt>
          <dd className="mt-1 font-semibold">{email}</dd>
        </div>
      </dl>
    </Card>
  );
}
