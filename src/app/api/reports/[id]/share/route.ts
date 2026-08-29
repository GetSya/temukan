import { auth } from "@/lib/auth";
import { getDataBin, updateDataBin } from "@/services/jvault.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  try {
    const bin = await getDataBin();
    const reportIndex = bin.reports.findIndex((r) => r.id === id);
    if (reportIndex === -1) {
      return new Response(JSON.stringify({ error: "Laporan tidak ditemukan" }), { status: 404 });
    }

    const currentCount = bin.reports[reportIndex].shareCount ?? 0;
    bin.reports[reportIndex].shareCount = currentCount + 1;
    bin.reports[reportIndex].updatedAt = new Date().toISOString();

    await updateDataBin(bin);

    return Response.json({ success: true, shareCount: bin.reports[reportIndex].shareCount });
  } catch (e) {
    console.error("Failed to increment share count:", e);
    return new Response(JSON.stringify({ error: "Gagal menambah share count" }), { status: 500 });
  }
}