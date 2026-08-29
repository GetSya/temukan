import { registerSchema } from "@/schemas/auth.schema";
import { getUsersBin, updateUsersBin } from "@/services/jvault.service";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`register:${ip}`, 5, 60_000);
  if (!rl.allowed) return new Response(JSON.stringify({ error: "Terlalu banyak percobaan" }), { status: 429 });

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });

  const { name, email, password, city } = parsed.data;
  const bin = await getUsersBin();
  if (bin.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return new Response(JSON.stringify({ error: "Email sudah terdaftar" }), { status: 409 });
  }
  const hash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const user = {
    id: uuid(),
    name,
    email,
    passwordHash: hash,
    avatar: null,
    city: city || "",
    createdAt: now,
    updatedAt: now,
    role: "user" as const,
  };
  bin.users.push(user as any);
  await updateUsersBin(bin);
  return Response.json({ ok: true, id: user.id });
}
