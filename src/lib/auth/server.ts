import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { APIError } from "better-auth/api";
import { ensureDbReady, getPglite, getSql } from "../db";
import { pgliteDialect } from "./pglite-dialect";

void ensureDbReady();

const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const authDisabled = env("VITE_AUTH_ENABLED") === "false";
export const authConfigured = !authDisabled;

const LOCAL_ORIGINS = ["http://localhost:8080", "http://127.0.0.1:8080"];
const explicitBaseURL = env("BETTER_AUTH_URL");
const vercelHost = env("VERCEL_URL");
const baseURL = explicitBaseURL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:8080");

const trustedOrigins = [baseURL, ...(vercelHost ? [`https://${vercelHost}`] : []), ...LOCAL_ORIGINS];

const globalRef = globalThis as typeof globalThis & { __llSecret__?: string };
function devSecret(): string {
  globalRef.__llSecret__ ??= randomBytes(32).toString("hex");
  return globalRef.__llSecret__;
}

const databaseUrl = env("DATABASE_URL");
const database = databaseUrl
  ? new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

export const SESSION_TOKEN_COOKIE = "__Host-ledgerline.session_token";

export const auth = betterAuth({
  baseURL,
  secret: env("BETTER_AUTH_SECRET") ?? devSecret(),
  database,
  trustedOrigins,
  session: { cookieCache: { enabled: true, maxAge: 300 } },
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        const sql = await getSql();
        const rows = await sql<{ role: string }>`select role from profiles where user_id = ${user.id}`;
        const role = rows[0]?.role;
        if (role === "admin" || role === "editor") {
          throw new APIError("BAD_REQUEST", {
            message: "Staff accounts can't be deleted here. Ask an admin to change your role first.",
          });
        }
      },
      afterDelete: async (user) => {
        const sql = await getSql();
        await sql`delete from article_saves where user_id = ${user.id}`;
        await sql`delete from profiles where user_id = ${user.id}`;
      },
    },
  },
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-ledgerline.session_data" },
      account_data: { name: "__Host-ledgerline.account_data" },
      dont_remember: { name: "__Host-ledgerline.dont_remember" },
    },
  },
  plugins: [bearer(), tanstackStartCookies()],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}

