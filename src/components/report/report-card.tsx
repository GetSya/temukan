import Link from "next/link";
import { Report } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { relativeTime } from "@/lib/time";

function categoryLabel(cat: string) {
  const m: Record<string,string> = { orang:"Orang", hewan:"Hewan", kendaraan:"Kendaraan", dokumen:"Dokumen", barang:"Barang", lainnya:"Lainnya" };
  return m[cat] || cat;
}

export function ReportCard({ report }: { report: Report }) {
  const isLost = report.type === "lost";
  return (
    <Link href={`/reports/${report.id}`} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
      <Card className="overflow-hidden h-full rounded-2xl border-stone-200 shadow-soft group-hover:shadow-soft-lg group-hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
        <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
          {report.images[0] ? (
            <img src={report.images[0]} alt={report.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-400 bg-stone-50">
              <span className="w-10 h-10 rounded-full bg-white border flex items-center justify-center">?</span>
              <span className="text-xs">Tidak ada foto</span>
            </div>
          )}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
            <Badge className={`rounded-full px-2.5 py-1 text-xs font-medium border shadow-sm ${isLost ? "bg-red-600 text-white border-red-600" : "bg-emerald-600 text-white border-emerald-600"}`}>{isLost? "Hilang":"Ditemukan"}</Badge>
            <Badge variant="secondary" className="rounded-full bg-white/95 backdrop-blur border-stone-200 text-stone-700 px-2.5 py-1 text-xs font-medium shadow-sm">{categoryLabel(report.category)}</Badge>
          </div>
          <div className="absolute top-2.5 right-2.5">
            <Badge variant="outline" className={`rounded-full px-2 py-1 text-[11px] bg-white/95 backdrop-blur shadow-sm ${report.status==="FOUND"?"text-emerald-700 border-emerald-200":report.status==="ACTIVE"?"text-stone-700":"text-stone-500"}`}>{report.status==="ACTIVE"?"Aktif":report.status==="FOUND"?"Sudah Ditemukan":report.status}</Badge>
          </div>
        </div>
        <CardContent className="p-3.5 flex flex-col flex-1 gap-2">
          <h3 className="font-semibold leading-snug line-clamp-2 text-[15px] group-hover:text-primary transition-colors">{report.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{report.description}</p>
          <div className="mt-auto pt-2 flex items-center gap-3 text-xs text-stone-500 border-t border-stone-100">
            <span className="flex items-center gap-1.5 min-w-0"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{report.location.city || report.location.addressApproximate}</span></span>
            <span className="flex items-center gap-1.5 shrink-0"><Clock className="w-3.5 h-3.5" />{relativeTime(report.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ReportCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border-stone-200">
      <div className="aspect-[4/3] bg-stone-100 animate-pulse" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-stone-100 rounded w-full animate-pulse" />
        <div className="h-3 bg-stone-100 rounded w-2/3 animate-pulse" />
      </div>
    </Card>
  );
}
