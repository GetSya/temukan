import { auth } from "@/lib/auth";
import { uploadToCatbox } from "@/services/catbox.service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const ip = getClientIp(req);
  const rl = rateLimit(`upload:${ip}`, 20, 60_000);
  if (!rl.allowed) return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new Response(JSON.stringify({ error: "No file" }), { status: 400 });

  // validation
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowed.includes(file.type)) return new Response(JSON.stringify({ error: "Format harus JPG/PNG/WebP" }), { status: 400 });
  if (file.size > 5 * 1024 * 1024) return new Response(JSON.stringify({ error: "Maksimal 5MB" }), { status: 400 });

  try {
    const result = await uploadToCatbox(file);
    // Catbox returns only URL, create thumb/medium same as url for compatibility
    return Response.json({ url: result.url, thumbUrl: result.url, mediumUrl: result.url });
  } catch (e: any) {
    // fallback to mock in dev if catbox fails
    if (process.env.NODE_ENV !== "production") {
      console.error("[catbox] upload error, fallback mock", e);
      const mockUrl = `https://picsum.photos/seed/${Date.now()}/800/600`;
      return Response.json({ url: mockUrl, thumbUrl: mockUrl });
    }
    return new Response(JSON.stringify({ error: e.message || "Upload gagal" }), { status: 500 });
  }
}
