import { auth } from "@/lib/auth";
import { getChatBin, updateChatBin } from "@/services/jvault.service";
import { v4 as uuid } from "uuid";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/chat/messages?conversationId=xxx
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) return new Response(JSON.stringify({ error: "conversationId required" }), { status: 400 });

  const userId = (session.user as any).id;
  const bin = await getChatBin();
  const convo = bin.conversations.find((c) => c.id === conversationId);
  if (!convo || !convo.participants.includes(userId)) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

  const messages = bin.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // mark as read for messages sent to me
  let changed = false;
  for (const m of messages) {
    if (m.senderId !== userId && !m.read) {
      m.read = true;
      changed = true;
    }
  }
  if (changed) await updateChatBin(bin);

  return Response.json({ messages });
}

// POST /api/chat/messages { conversationId, text }
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const ip = getClientIp(req);
  const rl = rateLimit(`chat:msg:${(session.user as any).id || ip}`, 30, 60_000);
  if (!rl.allowed) return new Response(JSON.stringify({ error: "Terlalu banyak pesan, coba lagi nanti" }), { status: 429 });

  const body = await req.json();
  const { conversationId, text } = body;
  if (!conversationId || !text || typeof text !== "string") return new Response(JSON.stringify({ error: "conversationId & text required" }), { status: 400 });
  const trimmed = text.trim();
  if (trimmed.length < 1) return new Response(JSON.stringify({ error: "Pesan kosong" }), { status: 400 });
  if (trimmed.length > 2000) return new Response(JSON.stringify({ error: "Pesan maksimal 2000 karakter" }), { status: 400 });

  // basic sanitasi
  const sanitized = trimmed.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const userId = (session.user as any).id;
  const bin = await getChatBin();
  const convo = bin.conversations.find((c) => c.id === conversationId);
  if (!convo || !convo.participants.includes(userId)) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

  const now = new Date().toISOString();
  const msg = {
    id: uuid(),
    conversationId,
    senderId: userId,
    text: sanitized,
    createdAt: now,
    read: false,
  };
  bin.messages.push(msg as any);
  convo.lastMessage = sanitized.slice(0, 80);
  convo.lastMessageAt = now;
  convo.updatedAt = now;

  // cap messages array to avoid bin bloat (keep last 5000)
  if (bin.messages.length > 5000) bin.messages = bin.messages.slice(-5000);

  await updateChatBin(bin);
  return Response.json({ message: msg }, { status: 201 });
}
