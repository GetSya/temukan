import { auth } from "@/lib/auth";
import { getDataBin } from "@/services/jvault.service";
import { ReportForm } from "@/components/report/report-form";
import { notFound, redirect } from "next/navigation";

export default async function EditPage({ params }: { params: Promise<{ id:string }>}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;
  const bin = await getDataBin();
  const report = bin.reports.find(r=> r.id===id);
  if (!report) return notFound();
  if (report.userId !== (session.user as any).id && session.user.email!=="admin@temu.id") redirect("/dashboard");
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Ubah Laporan</h1>
      <p className="text-sm text-muted-foreground mt-1">Perbarui informasi agar komunitas mendapat data terbaru.</p>
      <div className="mt-4">
        <ReportForm reportId={id} defaultValues={report as any} />
      </div>
    </div>
  );
}
