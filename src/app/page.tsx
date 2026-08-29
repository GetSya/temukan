import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/types";
import { getDataBin } from "@/services/jvault.service";
import { ReportCard } from "@/components/report/report-card";
import { Search, MapPin, CheckCircle2, ShieldCheck, Users, HeartHandshake, Clock3, ArrowRight, Megaphone, LocateFixed } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const bin = await getDataBin();
  const reports = bin.reports || [];
  const baru = reports.filter(r=> r.status==="ACTIVE").slice(0, 8);
  const ditemukan = reports.filter(r=> r.status==="FOUND").slice(0, 4);
  const stats = {
    total: reports.length,
    found: reports.filter(r=> r.status==="FOUND").length,
    active: reports.filter(r=> r.status==="ACTIVE").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* HERO */}
      <section className="pt-8 md:pt-12 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-stone-900 text-white border-stone-900">
            Komunitas gotong royong • 100% gratis
          </Badge>
          <div className="mt-5 flex justify-center">
            <img src="/logo.png" alt="TEMUKAN" className="h-14 md:h-16 w-auto object-contain" />
          </div>
          <h1 className="mt-4 text-[30px] md:text-[44px] font-bold leading-[0.95] tracking-tight text-balance">
            Bantu <span className="bg-primary text-primary-foreground px-2.5 py-0.5 rounded-lg">Temukan</span> yang Hilang.
          </h1>
          <p className="mt-3 text-[15px] md:text-base text-muted-foreground leading-relaxed text-balance">
            Laporkan dan cari orang, hewan, kendaraan, dokumen, dan barang hilang di sekitar Anda. Privasi terjaga, komunitas yang peduli.
          </p>

          {/* Primary Search */}
          <div className="mt-6 max-w-[640px] mx-auto">
            <Link href="/search" className="group block" aria-label="Cari laporan">
              <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-full p-1.5 shadow-soft group-hover:shadow-soft-lg group-hover:border-stone-300 transition-all">
                <div className="flex items-center gap-2 flex-1 min-w-0 pl-4">
                  <Search className="w-5 h-5 text-stone-400 shrink-0" />
                  <span className="text-sm text-stone-500 truncate text-left">Cari — contoh: “kucing oren Kebayoran”</span>
                </div>
                <span className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-medium shrink-0">Cari</span>
              </div>
            </Link>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Link href="/report?type=lost"><Button size="lg" className="rounded-full h-11 px-6 font-medium"><Megaphone className="w-4 h-4 mr-2" /> Laporkan Kehilangan</Button></Link>
              <Link href="/report?type=found"><Button size="lg" variant="outline" className="rounded-full h-11 px-6 bg-white border-stone-300 hover:bg-stone-50"><CheckCircle2 className="w-4 h-4 mr-2" /> Laporkan Penemuan</Button></Link>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Gratis • Tanpa alamat presisi untuk orang & hewan</p>
          </div>
        </div>
      </section>

      {/* Kategori */}
      <section className="py-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg md:text-xl font-semibold tracking-tight">Jelajahi kategori</h2>
          <Link href="/search" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">Lihat semua <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4">
          {CATEGORIES.map((c)=> {
            const Icon = c.icon;
            return (
            <Link key={c.value} href={`/search?category=${c.value}`} className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
              <Card className="rounded-2xl border-stone-200 shadow-soft group-hover:shadow-soft-lg group-hover:-translate-y-0.5 transition-all p-4 h-full text-center bg-white">
                <div className="w-10 h-10 mx-auto rounded-xl bg-stone-900 text-white flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-sm mt-3">{c.label}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-snug">{c.desc}</div>
              </Card>
            </Link>
          )})}
        </div>
      </section>

      {/* Sekitar Anda + Baru */}
      <section className="py-6 grid lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-stone-200 shadow-soft p-5 lg:col-span-1 bg-white">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center"><LocateFixed className="w-4 h-4 text-emerald-700" /></span>
            <h3 className="font-semibold">Laporan di Sekitar Anda</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Aktifkan lokasi untuk melihat laporan dalam radius pilihan Anda. Cocok untuk pencarian cepat di lingkungan.</p>
          <div className="mt-4 flex gap-2">
            <Link href="/search?sort=terdekat"><Button variant="outline" className="rounded-full bg-white"><MapPin className="w-4 h-4 mr-2" /> Cari terdekat</Button></Link>
            <Link href="/search"><Button variant="ghost" className="rounded-full">Atur radius</Button></Link>
          </div>
          <div className="mt-4 h-36 rounded-xl border border-dashed bg-stone-50 flex items-center justify-center text-xs text-muted-foreground">Peta & daftar akan tampil di halaman Cari</div>
        </Card>
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Clock3 className="w-5 h-5" /> Baru Dilaporkan</h2>
            <Link href="/search" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">Lihat semua <ArrowRight className="w-4 h-4" /></Link>
          </div>
          {baru.length===0 ? (
            <Card className="rounded-2xl border-dashed p-8 text-center mt-3 bg-white">
              <p className="text-sm text-muted-foreground">Belum ada laporan terbaru. Jadilah yang pertama membantu komunitas.</p>
              <Link href="/report"><Button className="rounded-full mt-3">Buat laporan pertama</Button></Link>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {baru.map(r=> <ReportCard key={r.id} report={r} />)}
            </div>
          )}
        </div>
      </section>

      {/* Sudah Ditemukan */}
      <section className="py-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-lg">Sudah Ditemukan</h2>
          <Badge variant="secondary" className="ml-2 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200">{ditemukan.length} cerita bahagia</Badge>
        </div>
        {ditemukan.length===0 ? (
          <Card className="rounded-2xl border-dashed p-6 text-center mt-3 bg-white text-sm text-muted-foreground">Belum ada yang ditandai ditemukan — setiap laporan yang kembali adalah kemenangan komunitas.</Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {ditemukan.map(r=> <ReportCard key={r.id} report={r} />)}
          </div>
        )}
      </section>

      {/* Statistik */}
      <section className="py-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-2xl p-5 text-center bg-white border-stone-200 shadow-soft">
            <div className="text-2xl md:text-3xl font-bold tracking-tight">{stats.total}</div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">Total laporan</div>
          </Card>
          <Card className="rounded-2xl p-5 text-center bg-white border-stone-200 shadow-soft">
            <div className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-700">{stats.found}</div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">Sudah ditemukan</div>
          </Card>
          <Card className="rounded-2xl p-5 text-center bg-white border-stone-200 shadow-soft">
            <div className="text-2xl md:text-3xl font-bold tracking-tight">{stats.active}</div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">Masih aktif</div>
          </Card>
        </div>
      </section>

      {/* Trust / Community */}
      <section className="py-8">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="rounded-2xl p-6 bg-white border-stone-200 shadow-soft">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h3 className="font-semibold mt-3">Privasi terjaga</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Alamat presisi tidak ditampilkan publik untuk kategori orang & hewan. Hanya perkiraan area.</p>
          </Card>
          <Card className="rounded-2xl p-6 bg-white border-stone-200 shadow-soft">
            <Users className="w-8 h-8 text-primary" />
            <h3 className="font-semibold mt-3">Komunitas peduli</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Setiap “Saya punya informasi” langsung jadi notifikasi untuk pemilik laporan.</p>
          </Card>
          <Card className="rounded-2xl p-6 bg-white border-stone-200 shadow-soft">
            <HeartHandshake className="w-8 h-8 text-primary" />
            <h3 className="font-semibold mt-3">Gotong royong</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Moderasi, laporan penyalahgunaan, dan audit log menjaga ruang tetap aman & terpercaya.</p>
          </Card>
        </div>
      </section>

      {/* Cara kerja */}
      <section className="py-6">
        <h2 className="text-center font-semibold text-lg">Cara kerja</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <Card className="rounded-2xl p-6 text-center bg-white border-stone-200 shadow-soft">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
            <h4 className="font-semibold mt-3">Laporkan</h4><p className="text-sm text-muted-foreground mt-1">Isi wizard 6 langkah dengan foto, ciri-ciri, dan lokasi perkiraan.</p>
          </Card>
          <Card className="rounded-2xl p-6 text-center bg-white border-stone-200 shadow-soft">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
            <h4 className="font-semibold mt-3">Sebarkan</h4><p className="text-sm text-muted-foreground mt-1">Laporan muncul di pencarian & sekitar lokasi.</p>
          </Card>
          <Card className="rounded-2xl p-6 text-center bg-white border-stone-200 shadow-soft">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
            <h4 className="font-semibold mt-3">Temukan</h4><p className="text-sm text-muted-foreground mt-1">Komunitas kirim petunjuk, Anda dapat notifikasi real-time.</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
