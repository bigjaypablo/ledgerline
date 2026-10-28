import { createAuthClient } from "better-auth/react";

/** Better Auth client (browser). Same-origin /api/auth/*, cookie sessions. */
export const authClient = createAuthClient();

export const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false";


/** Cookie auth only; kept so existing imports keep working. */
export function getBearerToken(): string | null {
  return null;
}

export async function signIn(): Promise<void> {
  throw new Error("Social sign-in is not configured. Use email and password.");
}

export async function signOut(redirectTo = "/"): Promise<void> {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message ?? "Sign-out failed");
  window.location.href = redirectTo;
}
