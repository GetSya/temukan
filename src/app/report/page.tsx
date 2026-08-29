import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportForm } from "@/components/report/report-form";

export default async function CreateReportPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/report");
  const sp = await searchParams;
  const defaultType = sp.type === "found" ? "found" : "lost";
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Buat Laporan</h1>
        <p className="text-sm text-muted-foreground mt-1">Ikuti 6 langkah — privasi dijaga, foto membantu ditemukan 5x lebih cepat.</p>
      </div>
      <ReportForm defaultValues={{ type: defaultType as any }} />
    </div>
  );
}
