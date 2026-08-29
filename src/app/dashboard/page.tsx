import { auth } from "@/lib/auth";
import { getDataBin } from "@/services/jvault.service";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { DashboardClient } from "./client";
import { FileText, CheckCircle2, Clock, Bookmark, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }>}){
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");
  const sp = await searchParams;
  const bin = await getDataBin();
  const userId = (session.user as any).id;
  const myReports = bin.reports.filter(r=> r.userId===userId);
  const savedIds = bin.savedReports.filter(s=> s.userId===userId).map(s=> s.reportId);
  const savedReports = bin.reports.filter(r=> savedIds.includes(r.id));
  const myTips = bin.reportTips.filter(t=> bin.reports.some(r=> r.id===t.reportId && r.userId===userId));
  const notifs = bin.notifications.filter(n=> n.userId===userId).sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());

  const totalReports = bin.reports.length;
  const stats = { total: myReports.length, active: myReports.filter(r=> r.status==="ACTIVE").length, found: myReports.filter(r=> r.status==="FOUND").length, saved: savedReports.length };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Halo, <span className="font-medium text-foreground">{session.user.name}</span> — kelola laporan, petunjuk, dan notifikasi Anda.</p>
      <p className="text-xs text-muted-foreground mt-1">ID Anda: <span className="font-mono">{userId.slice(0,8)}</span> • Login sebagai <span className="font-medium">{session.user.email}</span></p>
      {totalReports > 0 && myReports.length===0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm flex gap-2">
          <span className="text-amber-700">ℹ</span>
          <span>Ada <b>{totalReports} laporan</b> di sistem, tapi <b>0 milik Anda</b>. Dashboard hanya menampilkan <b>Laporan Saya</b> (filter <code className="bg-white px-1 rounded">userId === Anda</code>). Contoh “cekcekcek” milik <code className="bg-white px-1 rounded">andrerasya@gmail.com</code>. Lihat semua di <Link href="/search" className="underline font-medium">Cari</Link> atau <Link href="/" className="underline font-medium">Beranda</Link>.</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        <Card className="rounded-2xl p-5 text-center bg-white border-stone-200 shadow-soft">
          <FileText className="w-5 h-5 mx-auto text-stone-500" />
          <div className="text-2xl font-bold mt-1">{stats.total}</div><div className="text-xs text-muted-foreground">Laporan saya</div>
        </Card>
        <Card className="rounded-2xl p-5 text-center bg-white border-stone-200 shadow-soft">
          <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600" />
          <div className="text-2xl font-bold mt-1 text-emerald-700">{stats.found}</div><div className="text-xs text-muted-foreground">Sudah ditemukan</div>
        </Card>
        <Card className="rounded-2xl p-5 text-center bg-white border-stone-200 shadow-soft">
          <Clock className="w-5 h-5 mx-auto text-amber-600" />
          <div className="text-2xl font-bold mt-1">{stats.active}</div><div className="text-xs text-muted-foreground">Masih aktif</div>
        </Card>
        <Card className="rounded-2xl p-5 text-center bg-white border-stone-200 shadow-soft">
          <Bookmark className="w-5 h-5 mx-auto text-primary" />
          <div className="text-2xl font-bold mt-1">{stats.saved}</div><div className="text-xs text-muted-foreground">Tersimpan</div>
        </Card>
      </div>

      <Card className="rounded-2xl p-4 mt-4 bg-white border-stone-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center"><MessageCircle className="w-5 h-5" /></span>
          <div>
            <div className="font-medium text-sm">Pesan (Chat)</div>
            <div className="text-xs text-muted-foreground">Ngobrol langsung dengan pemilik laporan atau pemberi informasi</div>
          </div>
        </div>
        <Link href="/chat"><Button className="rounded-full">Buka Pesan</Button></Link>
      </Card>

      <DashboardClient myReports={myReports} savedReports={savedReports} myTips={myTips} notifs={notifs} initialTab={sp.tab || "reports"} />
    </div>
  );
}
