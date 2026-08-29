"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportSchema, ReportInput } from "@/schemas/report.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/components/upload/image-uploader";
import { LocationPicker } from "./location-picker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/types";
import { Search, FileText, Image as ImageIcon, MapPin, Eye, ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";

const STEPS = [
  { id: 1, title: "Jenis Laporan", desc: "Hilang atau ditemukan" },
  { id: 2, title: "Kategori", desc: "Pilih kategori" },
  { id: 3, title: "Detail", desc: "Judul & cerita" },
  { id: 4, title: "Foto", desc: "Unggah foto" },
  { id: 5, title: "Lokasi & Waktu", desc: "Kapan & di mana" },
  { id: 6, title: "Tinjau", desc: "Periksa & terbitkan" },
];

export function ReportForm({ defaultValues, reportId }: { defaultValues?: Partial<ReportInput>, reportId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const form = useForm<ReportInput>({
    resolver: zodResolver(reportSchema) as any,
    defaultValues: {
      type: "lost",
      category: "barang",
      title: "",
      description: "",
      ciriCiri: "",
      status: "ACTIVE",
      images: [],
      location: { latitude: -6.2, longitude: 106.8, city: "", province: "", country: "Indonesia", addressApproximate: "" },
      eventDate: new Date().toISOString().slice(0,10),
      eventTime: "",
      ...defaultValues as any,
    },
    mode: "onChange",
  });

  const vals = form.watch();
  const images = form.watch("images") || [];
  const location = form.watch("location");

  async function next() {
    // per-step validation with zod trigger
    if (step===3) {
      const ok = await form.trigger(["title", "description"]);
      if (!ok) { toast.error("Lengkapi judul (≥5) dan deskripsi (≥20 karakter)"); return; }
    }
    if (step===5) {
      const ok = await form.trigger(["eventDate", "location"]);
      const errs = form.formState.errors;
      if (!ok) {
        const msg = (errs.location as any)?.city?.message || (errs.location as any)?.province?.message || (errs.location as any)?.addressApproximate?.message || (errs.eventDate as any)?.message;
        toast.error(msg ? String(msg) : "Lengkapi tanggal, kota, provinsi, dan alamat perkiraan");
        return;
      }
      if (!location.city || !location.province || !location.addressApproximate) { toast.error("Lengkapi kota, provinsi, dan alamat perkiraan"); return; }
    }
    setStep(s=> Math.min(6, s+1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prev(){ setStep(s=> Math.max(1, s-1)); }

  async function onSubmit(data: ReportInput) {
    // fallback aman: jika provinsi kosong, isi dengan kota agar tidak blokir user
    if (data.location && !data.location.province?.trim() && data.location.city?.trim()) {
      data.location.province = data.location.city.trim();
    }
    setLoading(true);
    try {
      const url = reportId ? `/api/reports/${reportId}` : "/api/reports";
      const method = reportId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type":"application/json" }, body: JSON.stringify(data) });
      const j = await res.json().catch(()=> ({}));
      if (!res.ok) {
        const msg = j?.error ? (typeof j.error==="string"? j.error : JSON.stringify(j.error)) : `Gagal menyimpan (${res.status})`;
        throw new Error(msg);
      }
      toast.success(reportId ? "Laporan diperbarui" : "Laporan berhasil diterbitkan");
      router.push(`/reports/${j.id || reportId}`);
      router.refresh();
    } catch (e:any) { toast.error(e.message || "Terjadi kesalahan"); console.error(e); }
    finally { setLoading(false); }
  }

  function onInvalid(errs: any) {
    const first = errs.title?.message || errs.description?.message || errs.eventDate?.message || errs.location?.city?.message || errs.location?.province?.message || errs.location?.addressApproximate?.message || errs.location?.message;
    toast.error(first ? String(first) : "Periksa kembali isian — ada field yang belum valid. Cek langkah 3 dan 5.");
    // jump to relevant step
    if (errs.title || errs.description) setStep(3);
    else if (errs.eventDate || errs.location) setStep(5);
  }

  const progress = (step/6)*100;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-soft">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Langkah {step} dari 6</span>
          <span className="font-medium text-foreground">{STEPS[step-1].title}</span>
        </div>
        <div className="mt-2 h-2 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{width: `${progress}%`}} />
        </div>
        <div className="mt-3 grid grid-cols-6 gap-1">
          {STEPS.map(s=>(
            <div key={s.id} className={`h-1.5 rounded-full ${s.id<=step ? "bg-primary" : "bg-stone-200"}`} />
          ))}
        </div>
        <div className="mt-2 flex gap-1 text-[11px] text-muted-foreground hidden md:flex">
          {STEPS.map(s=> <span key={s.id} className={`flex-1 text-center ${s.id===step?"text-foreground font-medium":""}`}>{s.title}</span>)}
        </div>
      </div>

      <Card className="rounded-2xl border-stone-200 shadow-soft p-5 md:p-6 bg-white">
        {/* Step 1 Jenis */}
        {step===1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Search className="w-5 h-5" /> Jenis laporan apa yang ingin Anda buat?</h2>
            <p className="text-sm text-muted-foreground">Pilih salah satu. Anda bisa mengubahnya nanti.</p>
            <div className="grid md:grid-cols-2 gap-3 mt-2">
              <button type="button" onClick={()=> form.setValue("type","lost")} className={`text-left rounded-2xl border p-5 flex gap-4 items-start hover:border-stone-300 transition min-h-11 ${vals.type==="lost"?"border-primary bg-primary/5 ring-1 ring-primary":"bg-white border-stone-200"}`} aria-pressed={vals.type==="lost"}>
                <span className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0"><AlertCircle className="w-5 h-5 text-red-600" /></span>
                <span><span className="font-semibold block">Laporan Kehilangan</span><span className="text-sm text-muted-foreground">Saya kehilangan sesuatu dan butuh bantuan menemukannya.</span>{vals.type==="lost" && <span className="mt-2 inline-flex items-center gap-1 text-xs bg-primary text-white rounded-full px-2 py-1"><Check className="w-3 h-3" /> Dipilih</span>}</span>
              </button>
              <button type="button" onClick={()=> form.setValue("type","found")} className={`text-left rounded-2xl border p-5 flex gap-4 items-start hover:border-stone-300 transition min-h-11 ${vals.type==="found"?"border-primary bg-primary/5 ring-1 ring-primary":"bg-white border-stone-200"}`} aria-pressed={vals.type==="found"}>
                <span className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0"><Check className="w-5 h-5 text-emerald-700" /></span>
                <span><span className="font-semibold block">Laporan Penemuan</span><span className="text-sm text-muted-foreground">Saya menemukan sesuatu dan ingin mengembalikan ke pemilik.</span>{vals.type==="found" && <span className="mt-2 inline-flex items-center gap-1 text-xs bg-primary text-white rounded-full px-2 py-1"><Check className="w-3 h-3" /> Dipilih</span>}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 Kategori */}
        {step===2 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Pilih kategori</h2>
            <p className="text-sm text-muted-foreground">Kategori membantu laporan ditemukan lebih cepat.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map(c=>{
                const Icon = c.icon;
                const active = vals.category===c.value;
                return (
                  <button key={c.value} type="button" onClick={()=> form.setValue("category", c.value)} className={`rounded-2xl border p-4 text-left flex flex-col gap-2 hover:border-stone-300 transition min-h-11 focus-visible:ring-2 focus-visible:ring-ring ${active?"border-primary bg-primary/5 ring-1 ring-primary":"bg-white border-stone-200"}`}>
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${active?"bg-primary text-white":"bg-stone-900 text-white"}`}><Icon className="w-5 h-5" /></span>
                    <span className="font-medium text-sm">{c.label}</span>
                    <span className="text-xs text-muted-foreground leading-snug">{c.desc}</span>
                    {active && <span className="text-xs font-medium text-primary inline-flex items-center gap-1"><Check className="w-3 h-3" /> Dipilih</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 Detail */}
        {step===3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Ceritakan detailnya</h2>
            <div>
              <Label htmlFor="title">Judul laporan <span className="text-red-600">*</span></Label>
              <Input id="title" {...form.register("title")} placeholder="Contoh: Kucing oren hilang di Kebayoran, ciri kalung merah" className="mt-1 h-11 rounded-xl" />
              {form.formState.errors.title && <p className="text-xs text-red-600 mt-1">{form.formState.errors.title.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">Buat judul jelas dan spesifik agar mudah dicari.</p>
            </div>
            <div>
              <Label htmlFor="desc">Deskripsi lengkap <span className="text-red-600">*</span></Label>
              <Textarea id="desc" {...form.register("description")} rows={5} placeholder="Ceritakan kronologi, ciri fisik, kapan terakhir terlihat, dan informasi penting lainnya. Minimal 20 karakter." className="mt-1 rounded-xl" />
              {form.formState.errors.description && <p className="text-xs text-red-600 mt-1">{form.formState.errors.description.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">{vals.description?.length || 0}/2000 karakter</p>
            </div>
            <div>
              <Label htmlFor="ciri">Ciri-ciri khusus (opsional)</Label>
              <Textarea id="ciri" {...form.register("ciriCiri")} rows={2} placeholder="Contoh: warna bulu oren putih, ekor pendek, penakut terhadap orang asing" className="mt-1 rounded-xl" />
            </div>
          </div>
        )}

        {/* Step 4 Foto */}
        {step===4 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Tambahkan foto</h2>
            <p className="text-sm text-muted-foreground">Foto membantu laporan 5x lebih mudah ditemukan. Seret & lepas atau pilih dari galeri.</p>
            <ImageUploader value={images} onChange={(urls)=> form.setValue("images", urls)} />
          </div>
        )}

        {/* Step 5 Lokasi & Waktu */}
        {step===5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><MapPin className="w-5 h-5" /> Kapan & di mana?</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><Label htmlFor="eventDate">Tanggal kejadian <span className="text-red-600">*</span></Label><Input id="eventDate" type="date" {...form.register("eventDate")} className="mt-1 h-11 rounded-xl" /></div>
              <div><Label htmlFor="eventTime">Waktu (opsional)</Label><Input id="eventTime" type="time" {...form.register("eventTime")} className="mt-1 h-11 rounded-xl" /></div>
            </div>
            <LocationPicker value={location} onChange={(v)=> form.setValue("location", v)} />
            {form.formState.errors.location && <p className="text-xs text-red-600">{JSON.stringify((form.formState.errors.location as any).message)}</p>}
          </div>
        )}

        {/* Step 6 Review */}
        {step===6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Eye className="w-5 h-5" /> Tinjau sebelum diterbitkan</h2>
            <p className="text-sm text-muted-foreground">Pastikan semua informasi sudah benar. Anda masih bisa mengubahnya setelah terbit.</p>

            <div className="rounded-2xl border bg-stone-50 p-4 space-y-3 text-sm">
              <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Jenis</span><span className="font-medium">{vals.type==="lost"?"Laporan Kehilangan":"Laporan Penemuan"}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Kategori</span><span className="font-medium">{CATEGORIES.find(c=>c.value===vals.category)?.label}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Judul</span><span className="font-medium">{vals.title || "-"}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Deskripsi</span><span className="line-clamp-3">{vals.description || "-"}</span></div>
              {vals.ciriCiri && <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Ciri-ciri</span><span>{vals.ciriCiri}</span></div>}
              <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Foto</span><span>{images.length} foto {images.length===0 && <span className="text-amber-600">(disarankan tambah minimal 1)</span>}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Waktu</span><span>{vals.eventDate} {vals.eventTime}</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Lokasi</span><span>{location.addressApproximate}, {location.city} {location.province && `• ${location.province}`}</span></div>
            </div>

            {images.length>0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.slice(0,6).map((u,i)=> <img key={i} src={u} alt={`Foto ${i+1}`} className="aspect-square object-cover rounded-xl border" />)}
              </div>
            )}

            <Card className="rounded-xl bg-amber-50 border-amber-200 p-3 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span className="text-amber-900">Dengan menerbitkan, Anda menyetujui laporan ini dapat dilihat publik dan dibagikan. Jangan cantumkan data sensitif seperti NIK lengkap atau alamat rumah presisi.</span>
            </Card>
          </div>
        )}

        {/* Nav */}
        <div className="flex gap-2 pt-4 border-t mt-6">
          {step>1 ? <Button type="button" variant="outline" onClick={prev} className="rounded-full h-11 px-6 bg-white"><ChevronLeft className="w-4 h-4 mr-1" /> Kembali</Button> : <div className="flex-1" />}
          <div className="flex-1" />
          {step<6 ? (
            <Button type="button" onClick={next} className="rounded-full h-11 px-6">Lanjut <ChevronRight className="w-4 h-4 ml-1" /></Button>
          ) : (
            <Button type="button" onClick={form.handleSubmit(onSubmit, onInvalid)} disabled={loading} aria-busy={loading} className="rounded-full h-11 px-8 font-medium disabled:opacity-50">
              {loading ? "Menerbitkan..." : reportId ? "Simpan Perubahan" : "Terbitkan Laporan"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
