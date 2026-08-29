import { auth } from "@/lib/auth";
import { getDataBin, updateDataBin } from "@/services/jvault.service";
import { reportSchema } from "@/schemas/report.schema";
import { v4 as uuid } from "uuid";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bin = await getDataBin();
  const report = bin.reports.find((r) => r.id === id);
  if (!report) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  return Response.json(report);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const { id } = await params;
  const bin = await getDataBin();
  const idx = bin.reports.findIndex((r) => r.id === id);
  if (idx === -1) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  const existing = bin.reports[idx];
  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === "admin"; // not used yet
  if (existing.userId !== userId && !isAdmin) {
    // also allow if user email is admin (simple check)
    const isAdminEmail = session.user.email === "admin@temu.id";
    if (!isAdminEmail) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  const body = await req.json();
  // allow partial update
  const parsed = reportSchema.partial().safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });

  const updated = { ...existing, ...parsed.data, updatedAt: new Date().toISOString(), foundAt: body.foundAt ?? existing.foundAt };
  if (body.status === "FOUND" && !existing.foundAt) (updated as any).foundAt = new Date().toISOString();
  bin.reports[idx] = updated as any;
  bin.auditLogs.push({ id: uuid(), action: "UPDATE_REPORT", userId, targetId: id, createdAt: new Date().toISOString() });
  await updateDataBin(bin);
  return Response.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const { id } = await params;
  const bin = await getDataBin();
  const report = bin.reports.find((r) => r.id === id);
  if (!report) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  const userId = (session.user as any).id;
  const isAdminEmail = session.user.email === "admin@temu.id";
  if (report.userId !== userId && !isAdminEmail) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  bin.reports = bin.reports.filter((r) => r.id !== id);
  bin.auditLogs.push({ id: uuid(), action: "DELETE_REPORT", userId, targetId: id, createdAt: new Date().toISOString() });
  await updateDataBin(bin);
  return Response.json({ ok: true });
}
