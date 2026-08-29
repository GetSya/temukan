import { auth } from "@/lib/auth";
import { getDataBin, updateDataBin } from "@/services/jvault.service";
import { v4 as uuid } from "uuid";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const bin = await getDataBin();
  const userId = (session.user as any).id;
  const saved = bin.savedReports.filter((s) => s.userId === userId);
  // join reports
  const reports = saved.map((s) => bin.reports.find((r) => r.id === s.reportId)).filter(Boolean);
  return Response.json({ saved, reports });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const { reportId } = await req.json();
  if (!reportId) return new Response(JSON.stringify({ error: "reportId required" }), { status: 400 });
  const bin = await getDataBin();
  const userId = (session.user as any).id;
  if (bin.savedReports.some((s) => s.userId === userId && s.reportId === reportId)) {
    return Response.json({ ok: true });
  }
  bin.savedReports.push({ id: uuid(), userId, reportId, createdAt: new Date().toISOString() } as any);
  await updateDataBin(bin);
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get("reportId");
  const bin = await getDataBin();
  const userId = (session.user as any).id;
  bin.savedReports = bin.savedReports.filter((s) => !(s.userId === userId && s.reportId === reportId));
  await updateDataBin(bin);
  return Response.json({ ok: true });
}
