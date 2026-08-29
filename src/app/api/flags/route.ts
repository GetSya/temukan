import { auth } from "@/lib/auth";
import { getDataBin, updateDataBin } from "@/services/jvault.service";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const { reportId, reason } = await req.json();
  if (!reportId || !reason) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  const bin = await getDataBin();
  bin.flags.push({ id: uuid(), reportId, userId: (session.user as any).id, reason, createdAt: new Date().toISOString() } as any);
  bin.auditLogs.push({ id: uuid(), action: "FLAG_REPORT", userId: (session.user as any).id, targetId: reportId, details: reason, createdAt: new Date().toISOString() } as any);
  await updateDataBin(bin);
  return Response.json({ ok: true });
}
