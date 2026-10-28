import { authClient } from "@/lib/auth/client";

export async function emailSignIn(email: string, password: string): Promise<void> {
  const result = await authClient.signIn.email({ email, password, callbackURL: "/account" });
  if (result.error) throw new Error(result.error.message || "Sign-in failed.");
}

export async function emailSignUp(name: string, email: string, password: string): Promise<void> {
  const result = await authClient.signUp.email({ email, password, name, callbackURL: "/account" });
  if (result.error) throw new Error(result.error.message || "Could not create that account.");
}
