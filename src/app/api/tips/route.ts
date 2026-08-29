import { auth } from "@/lib/auth";
import { getDataBin, updateDataBin } from "@/services/jvault.service";
import { tipSchema } from "@/schemas/report.schema";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();
  const parsed = tipSchema.safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });

  const bin = await getDataBin();
  const tip = {
    id: uuid(),
    reportId: parsed.data.reportId,
    userId: (session?.user as any)?.id || null,
    message: parsed.data.message,
    location: parsed.data.location,
    seenAt: parsed.data.seenAt,
    contact: parsed.data.contact,
    image: parsed.data.image || null,
    createdAt: new Date().toISOString(),
  };
  bin.reportTips.push(tip as any);
  // notify owner
  const report = bin.reports.find((r) => r.id === tip.reportId);
  if (report) {
    bin.notifications.push({
      id: uuid(),
      userId: report.userId,
      title: "Informasi baru",
      message: `Ada informasi baru untuk laporan "${report.title}"`,
      read: false,
      reportId: report.id,
      createdAt: new Date().toISOString(),
    } as any);
  }
  await updateDataBin(bin);
  return Response.json(tip, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get("reportId");
  const bin = await getDataBin();
  const tips = reportId ? bin.reportTips.filter((t) => t.reportId === reportId) : bin.reportTips;
  return Response.json({ tips });
}
