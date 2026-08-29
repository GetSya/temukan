import { auth } from "@/lib/auth";
import { getDataBin, updateDataBin } from "@/services/jvault.service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const bin = await getDataBin();
  const notifs = bin.notifications.filter((n) => n.userId === (session.user as any).id).sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  return Response.json({ notifications: notifs });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const { id } = await req.json();
  const bin = await getDataBin();
  const notif = bin.notifications.find((n) => n.id === id && n.userId === (session.user as any).id);
  if (notif) notif.read = true;
  await updateDataBin(bin);
  return Response.json({ ok: true });
}
