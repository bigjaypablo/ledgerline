export const SECTIONS = [
  ["profile", "Profile"],
  ["saved", "Saved articles"],
  ["preferences", "Preferences"],
  ["session", "Sign out"],
] as const;

export type SectionId = (typeof SECTIONS)[number][0];

export function asSection(value: unknown): SectionId {
  return SECTIONS.some(([id]) => id === value) ? (value as SectionId) : "profile";
}
