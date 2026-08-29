import { getDataBin, getUsersBin } from "@/services/jvault.service";
import { findSimilar } from "@/lib/similar";
import { ReportCard } from "@/components/report/report-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, User, Clock, ShieldCheck, PackageOpen, LocateFixed } from "lucide-react";
import { TipForm } from "./tip-form";
import { ReportActions } from "./actions";
import { notFound } from "next/navigation";
import { relativeTime, formatDateID } from "@/lib/time";
import { categoryLabel } from "@/types";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const bin = await getDataBin();
  const report = bin.reports.find((r) => r.id === id);

  if (!report) {
    return { title: "Laporan tidak ditemukan" };
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://temukan.app";
  const reportUrl = `${baseUrl}/reports/${report.id}`;
  const isLost = report.type === "lost";
  const ogImageUrl = `${baseUrl}/reports/${report.id}/opengraph-image`;

  return {
    title: `${report.title} | TEMUKAN`,
    description: report.description.slice(0, 160),
    openGraph: {
      title: report.title,
      description: report.description.slice(0, 160),
      url: reportUrl,
      siteName: "TEMUKAN by AcaMedia",
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${report.title} - ${isLost ? "Hilang" : "Ditemukan"} di ${report.location.city}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: report.title,
      description: report.description.slice(0, 160),
      images: [ogImageUrl],
    },
    other: {
      "og:image": ogImageUrl,
      "og:image:width": "1200",
      "og:image:height": "630",
    },
  };
}

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bin = await getDataBin();
  const usersBin = await getUsersBin();
  const report = bin.reports.find(r=> r.id===id);
  if (!report) return notFound();
  const owner = usersBin.users.find(u=> u.id===report.userId);
  const tips = bin.reportTips.filter(t=> t.reportId===id);
  const similar = findSimilar(bin.reports, report);
  const isLost = report.type==="lost";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Gallery */}
          <Card className="overflow-hidden rounded-2xl border-stone-200 shadow-soft bg-white p-0">
            {report.images.length>0 ? (
              <div className="grid grid-cols-2 gap-1 bg-stone-100">
                {report.images.map((url,i)=> (
                  <img key={i} src={url} alt={`${report.title} foto ${i+1}`} loading="lazy" className={i===0?"col-span-2 aspect-[16/9] object-cover":"aspect-square object-cover"} />
                ))}
              </div>
            ) : (
              <div className="aspect-[16/9] bg-stone-50 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <PackageOpen className="w-10 h-10" />
                <span className="text-sm">Tidak ada foto</span>
              </div>
            )}
          </Card>

          <Card className="rounded-2xl border-stone-200 shadow-soft p-5 md:p-6 bg-white">
            <div className="flex flex-wrap gap-1.5">
              <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${isLost ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>{isLost? "Hilang":"Ditemukan"}</Badge>
              <Badge variant="secondary" className="rounded-full bg-stone-900 text-white border-stone-900 px-3 py-1 text-xs">{categoryLabel(report.category as any)}</Badge>
              <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs ${report.status==="FOUND"?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-white"}`}>{report.status==="ACTIVE"?"Aktif":report.status==="FOUND"?"Sudah Ditemukan":report.status}</Badge>
              <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{relativeTime(report.createdAt)}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-3">{report.title}</h1>
            <p className="mt-3 text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap">{report.description}</p>
            {report.ciriCiri && <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm leading-relaxed"><span className="font-semibold">Ciri-ciri:</span> {report.ciriCiri}</div>}
            <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex gap-2 items-start bg-stone-50 border rounded-xl p-3">
                <Calendar className="w-4 h-4 mt-0.5 text-stone-500" />
                <div><div className="font-medium">Waktu kejadian</div><div className="text-muted-foreground">{formatDateID(report.eventDate)} {report.eventTime && `• ${report.eventTime}`}</div></div>
              </div>
              <div className="flex gap-2 items-start bg-stone-50 border rounded-xl p-3">
                <MapPin className="w-4 h-4 mt-0.5 text-stone-500" />
                <div><div className="font-medium">Lokasi perkiraan</div><div className="text-muted-foreground">{report.location.addressApproximate}</div><div className="text-xs text-muted-foreground">{report.location.city}{report.location.province ? `, ${report.location.province}` : ""}</div></div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <LocateFixed className="w-3.5 h-3.5" /> {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)} • Perkiraan, bukan alamat presisi
            </div>
          </Card>

          <Card className="rounded-2xl border-stone-200 shadow-soft p-5 bg-white">
            <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Informasi pelapor</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2"><User className="w-4 h-4" />{owner?.name || "Anonim"} • {owner?.city || report.location.city}</p>
            <p className="text-xs text-muted-foreground mt-1">Privasi dijaga. Hubungi via “Saya Punya Informasi” — pemilik akan dapat notifikasi.</p>
          </Card>

          <div className="pt-2">
            <h3 className="font-semibold">Laporan yang mungkin terkait</h3>
            <p className="text-xs text-muted-foreground">Berdasarkan kategori, kata kunci, lokasi, dan waktu.</p>
            {similar.length===0 ? <p className="text-sm text-muted-foreground mt-3 bg-white border rounded-2xl p-4">Tidak ada laporan serupa yang ditemukan.</p> : (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {similar.map(r=> <ReportCard key={r.id} report={r} />)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <ReportActions report={report} />
          <Card className="rounded-2xl border-stone-200 shadow-soft p-5 bg-white">
            <h3 className="font-semibold">Saya punya informasi</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Kirim petunjuk agar pemilik bisa menemukan. Anda bisa sertakan lokasi, waktu melihat, dan kontak opsional.</p>
            <div className="mt-4">
              <TipForm reportId={report.id} />
            </div>
          </Card>
          {tips.length>0 && (
            <Card className="rounded-2xl border-stone-200 shadow-soft p-5 bg-white">
              <h4 className="font-semibold text-sm">Petunjuk masuk ({tips.length})</h4>
              <ul className="mt-3 space-y-2">
                {tips.map(t=>(
                  <li key={t.id} className="text-xs border border-stone-200 rounded-xl p-3 bg-stone-50">
                    <div className="text-sm text-foreground leading-relaxed">{t.message}</div>
                    {t.location && <div className="text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.location}</div>}
                    <div className="text-muted-foreground mt-1">{new Date(t.createdAt).toLocaleString("id-ID")}</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
