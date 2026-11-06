import { ThemeToggle } from "@/components/editorial/theme-toggle";
import { Card } from "./card";

export function PreferencesSection() {
  return (
    <Card title="Preferences">
      <p className="mb-2 text-xs font-bold tracking-widest text-muted uppercase">Theme</p>
      <ThemeToggle />
    </Card>
  );
}
