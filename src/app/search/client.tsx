"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ReportCard, ReportCardSkeleton } from "@/components/report/report-card";
import { Report } from "@/types";
import { Search, MapPin, LocateFixed, Filter, Calendar, ArrowUpDown, X } from "lucide-react";
import Link from "next/link";

export function SearchClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [q, setQ] = useState(sp.get("q") || "");
  const [category, setCategory] = useState(sp.get("category") || "all");
  const [status, setStatus] = useState(sp.get("status") || "all");
  const [city, setCity] = useState(sp.get("city") || "");
  const [dateFrom, setDateFrom] = useState(sp.get("from") || "");
  const [dateTo, setDateTo] = useState(sp.get("to") || "");
  const [sort, setSort] = useState(sp.get("sort") || "terbaru");
  const [lat, setLat] = useState(sp.get("lat") || "");
  const [lng, setLng] = useState(sp.get("lng") || "");
  const [radius, setRadius] = useState(sp.get("radius") || "20");

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category !== "all") params.set("category", category);
    if (status !== "all") params.set("status", status);
    if (city) params.set("city", city);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (sort) params.set("sort", sort);
    if (lat && lng) { params.set("lat", lat); params.set("lng", lng); params.set("radius", radius); }
    router.replace(`/search?${params.toString()}`, { scroll: false });
    const res = await fetch(`/api/reports?${params.toString()}`);
    const data = await res.json();
    // client-side date filter
    let filtered: Report[] = data.reports || [];
    if (dateFrom) filtered = filtered.filter(r=> new Date(r.eventDate) >= new Date(dateFrom));
    if (dateTo) filtered = filtered.filter(r=> new Date(r.eventDate) <= new Date(dateTo));
    setReports(filtered);
    setLoading(false);
    setHasSearched(true);
  }

  useEffect(()=>{ fetchData(); }, []);

  function useMyLocation(){
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(p=>{
      setLat(String(p.coords.latitude));
      setLng(String(p.coords.longitude));
    })
  }
  function clearFilters(){
    setQ(""); setCategory("all"); setStatus("all"); setCity(""); setDateFrom(""); setDateTo(""); setLat(""); setLng(""); setSort("terbaru");
  }

  const activeCount = [q, category!=="all"?1:"", status!=="all"?1:"", city, dateFrom, dateTo, lat].filter(Boolean).length;

  return (
    <>
      <Card className="mt-4 bg-white rounded-2xl border-stone-200 shadow-soft p-4 md:p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="w-4 h-4" /> Filter pencarian
          {activeCount>0 && <span className="ml-2 text-xs bg-stone-900 text-white rounded-full px-2 py-0.5">{activeCount} aktif</span>}
          <Button variant="ghost" size="sm" className="ml-auto h-8 rounded-full" onClick={clearFilters}><X className="w-4 h-4 mr-1" /> Bersihkan</Button>
        </div>

        <div className="mt-3">
          <Label htmlFor="q" className="text-xs">Kata kunci</Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input id="q" placeholder="Contoh: kucing oren, KTP, motor beat..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=> e.key==="Enter" && fetchData()} className="pl-9 h-11 rounded-full bg-stone-50 border-stone-200" aria-label="Kata kunci pencarian" />
            </div>
            <Button onClick={fetchData} className="rounded-full h-11 px-6">Cari</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div>
            <Label className="text-xs">Kategori</Label>
            <Select value={category} onValueChange={(v)=> setCategory(v || "all")}>
              <SelectTrigger className="mt-1 rounded-full h-11 bg-white" aria-label="Kategori"><SelectValue placeholder="Kategori" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Semua kategori</SelectItem><SelectItem value="orang">Orang</SelectItem><SelectItem value="hewan">Hewan</SelectItem><SelectItem value="kendaraan">Kendaraan</SelectItem><SelectItem value="dokumen">Dokumen</SelectItem><SelectItem value="barang">Barang</SelectItem><SelectItem value="lainnya">Lainnya</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={(v)=> setStatus(v || "all")}>
              <SelectTrigger className="mt-1 rounded-full h-11 bg-white" aria-label="Status"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Semua status</SelectItem><SelectItem value="ACTIVE">Aktif</SelectItem><SelectItem value="FOUND">Sudah ditemukan</SelectItem><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="CLOSED">Ditutup</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Kota / Provinsi</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input placeholder="Jakarta, Bandung..." value={city} onChange={e=> setCity(e.target.value)} className="pl-9 h-11 rounded-full bg-white" aria-label="Kota" />
            </div>
          </div>
          <div>
            <Label className="text-xs flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Urutkan</Label>
            <Select value={sort} onValueChange={(v)=> setSort(v || "terbaru")}>
              <SelectTrigger className="mt-1 rounded-full h-11 bg-white" aria-label="Urutan"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="terbaru">Terbaru</SelectItem><SelectItem value="terdekat">Terdekat</SelectItem><SelectItem value="relevan">Paling relevan</SelectItem></SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Dari tanggal</Label>
            <Input type="date" value={dateFrom} onChange={e=> setDateFrom(e.target.value)} className="mt-1 h-11 rounded-full bg-white" />
          </div>
          <div>
            <Label className="text-xs">Sampai tanggal</Label>
            <Input type="date" value={dateTo} onChange={e=> setDateTo(e.target.value)} className="mt-1 h-11 rounded-full bg-white" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <Button variant="outline" onClick={useMyLocation} className="rounded-full bg-white"><LocateFixed className="w-4 h-4 mr-2" /> Gunakan lokasi saya</Button>
          {lat && lng && (
            <div className="flex items-center gap-2 text-xs bg-stone-50 border rounded-full px-3 py-1.5">
              <span>Lokasi: {Number(lat).toFixed(3)}, {Number(lng).toFixed(3)}</span>
              <span className="flex items-center gap-1"><Input value={radius} onChange={e=> setRadius(e.target.value)} className="w-16 h-7 rounded-full" aria-label="Radius km" /> km</span>
              <Button variant="ghost" size="sm" className="h-7 rounded-full" onClick={()=>{setLat("");setLng("");}}>Hapus</Button>
            </div>
          )}
          <span className="text-xs text-muted-foreground ml-auto hidden md:inline">Hasil bisa dibagikan via URL — salin link di address bar.</span>
        </div>
      </Card>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({length:8}).map((_,i)=> <ReportCardSkeleton key={i} />)}
          </div>
        ) : reports.length===0 ? (
          <Card className="rounded-2xl border-dashed p-8 md:p-10 text-center bg-white mt-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center"><Search className="w-6 h-6 text-stone-500" /></div>
            <h3 className="font-semibold mt-3">Tidak ada laporan ditemukan</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">Coba ubah kata kunci, kategori, atau radius. Atau buat laporan baru agar komunitas bisa membantu.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/report"><Button className="rounded-full">Buat laporan</Button></Link>
              <Button variant="outline" className="rounded-full bg-white" onClick={clearFilters}>Reset filter</Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{reports.length}</span> laporan ditemukan</p>
              <Button variant="ghost" size="sm" className="rounded-full" onClick={()=> navigator.clipboard.writeText(window.location.href)}>Salin link pencarian</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {reports.map(r=> <ReportCard key={r.id} report={r} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
