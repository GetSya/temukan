import { auth } from "@/lib/auth";
import { getChatBin, updateChatBin, getUsersBin } from "@/services/jvault.service";
import { v4 as uuid } from "uuid";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/chat/conversations -> list for current user
export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const userId = (session.user as any).id;
  const bin = await getChatBin();
  const usersBin = await getUsersBin();

  const convs = bin.conversations
    .filter((c) => c.participants.includes(userId))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((c) => {
      const otherId = c.participants.find((p) => p !== userId)!;
      const otherUser = usersBin.users.find((u) => u.id === otherId);
      const unread = bin.messages.filter((m) => m.conversationId === c.id && m.senderId !== userId && !m.read).length;
      return {
        ...c,
        otherUser: otherUser ? { id: otherUser.id, name: otherUser.name, avatar: otherUser.avatar } : null,
        unread,
      };
    });

  return Response.json({ conversations: convs });
}

// POST /api/chat/conversations { otherUserId, reportId? } -> get or create
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const ip = getClientIp(req);
  const rl = rateLimit(`chat:create:${(session.user as any).id || ip}`, 10, 60_000);
  if (!rl.allowed) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429 });

  const body = await req.json();
  const { otherUserId, reportId } = body;
  if (!otherUserId) return new Response(JSON.stringify({ error: "otherUserId required" }), { status: 400 });

  const myId = (session.user as any).id;
  if (otherUserId === myId) return new Response(JSON.stringify({ error: "Cannot chat with yourself" }), { status: 400 });

  const usersBin = await getUsersBin();
  if (!usersBin.users.some((u) => u.id === otherUserId)) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  const bin = await getChatBin();

  // find existing conversation between these two, optionally same reportId
  let convo = bin.conversations.find((c) => {
    const hasBoth = c.participants.includes(myId) && c.participants.includes(otherUserId);
    if (!hasBoth) return false;
    if (reportId) return c.reportId === reportId;
    // if no reportId specified, match conversation without reportId (general)
    if (!c.reportId && !reportId) return true;
    // allow matching any if one side has no reportId but we search general? prefer exact
    return false;
  });

  // fallback: any conversation between two users if reportId not found
  if (!convo && reportId) {
    convo = bin.conversations.find((c) => c.participants.includes(myId) && c.participants.includes(otherUserId) && !c.reportId);
  }

  if (!convo) {
    const now = new Date().toISOString();
    convo = {
      id: uuid(),
      participants: [myId, otherUserId],
      reportId: reportId || null,
      createdAt: now,
      updatedAt: now,
      lastMessage: "",
    };
    bin.conversations.push(convo as any);
    await updateChatBin(bin);
  }

  return Response.json({ conversation: convo });
}
