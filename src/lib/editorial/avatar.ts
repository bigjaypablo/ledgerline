import { put } from "@vercel/blob";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

async function ensureRow(userId: string) {
  const sql = await getSql();
  const u = await sql<{ name: string }>`
    select name from "user" where id = ${userId}
  `;
  const name = (u[0]?.name || "Reader").slice(0, 80);
  await sql`
    insert into profiles (user_id, display_name, role)
    values (${userId}, ${name}, 'reader')
    on conflict do nothing
  `;
  return sql;
}

export const getMyAvatar = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ensureRow(context.userId);
    const rows = await sql<{ avatar_url: string | null }>`
      select avatar_url from profiles where user_id = ${context.userId}
    `;
    return { avatarUrl: rows[0]?.avatar_url ?? "" };
  });

export const uploadMyAvatar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { dataUrl?: string }) => ({
    dataUrl: String(input?.dataUrl ?? ""),
  }))
  .handler(async ({ context, data }) => {
    const re = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/;
    const m = re.exec(data.dataUrl);
    if (!m) throw new Error("Only JPEG photos are accepted.");
    const bytes = Buffer.from(m[1], "base64");
    if (bytes.length > 300_000) throw new Error("That photo is too large.");
    const blob = await put(`avatars/${context.userId}.jpg`, bytes, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: true,
    });
    const sql = await ensureRow(context.userId);
    await sql`
      update profiles set avatar_url = ${blob.url}
      where user_id = ${context.userId}
    `;
    return { url: blob.url };
  });

export const removeMyAvatar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ensureRow(context.userId);
    await sql`
      update profiles set avatar_url = ''
      where user_id = ${context.userId}
    `;
    return { ok: true };
  });
