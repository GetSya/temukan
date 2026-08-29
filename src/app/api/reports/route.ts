import { auth } from "@/lib/auth";
import { getDataBin, updateDataBin } from "@/services/jvault.service";
import { reportSchema } from "@/schemas/report.schema";
import { v4 as uuid } from "uuid";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bin = await getDataBin();
  let reports = bin.reports;

  // filters
  const q = searchParams.get("q")?.toLowerCase();
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const city = searchParams.get("city");
  const type = searchParams.get("type");
  const sort = searchParams.get("sort") || "terbaru";
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  const radius = parseFloat(searchParams.get("radius") || "50");

  if (q) reports = reports.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  if (category) reports = reports.filter((r) => r.category === category);
  if (status) reports = reports.filter((r) => r.status === status);
  if (city) reports = reports.filter((r) => r.location.city.toLowerCase().includes(city.toLowerCase()));
  if (type) reports = reports.filter((r) => r.type === type);

  if (!isNaN(lat) && !isNaN(lng)) {
    const { haversine } = await import("@/lib/geo");
    reports = reports.filter((r) => haversine(lat, lng, r.location.latitude, r.location.longitude) <= radius);
    if (sort === "terdekat") {
      reports = reports.sort((a, b) => haversine(lat, lng, a.location.latitude, a.location.longitude) - haversine(lat, lng, b.location.latitude, b.location.longitude));
    }
  }

  if (sort === "terbaru") reports = reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return Response.json({ reports });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const ip = getClientIp(req);
  const rl = rateLimit(`create:${(session.user as any).id || ip}`, 10, 60_000);
  if (!rl.allowed) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429 });

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });

  if (parsed.data.images && parsed.data.images.length > 10) return new Response(JSON.stringify({ error: "Maksimal 10 gambar" }), { status: 400 });

  const bin = await getDataBin();
  const now = new Date().toISOString();
  const report = {
    id: uuid(),
    userId: (session.user as any).id,
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
    foundAt: null,
  };
  bin.reports.unshift(report as any);
  bin.auditLogs.push({ id: uuid(), action: "CREATE_REPORT", userId: report.userId, targetId: report.id, createdAt: now });
  await updateDataBin(bin);
  return Response.json(report, { status: 201 });
}
