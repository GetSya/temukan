"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LocateFixed, MapPin, Search, ShieldCheck, Info } from "lucide-react";

export function LocationPicker({ value, onChange }: { value: any; onChange: (v:any)=>void }) {
  const [search, setSearch] = useState("");

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos)=>{
      onChange({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        city: value.city || "",
        province: value.province || "",
        country: "Indonesia",
        addressApproximate: value.addressApproximate || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
      });
    }, ()=> alert("Gagal mendapatkan lokasi. Aktifkan GPS dan izinkan akses."));
  }

  function searchLocation(){
    if (!search) return;
    // Simple nominatim search fallback - use openstreetmap directly without exposing key, or just set addressApproximate
    onChange({ ...value, addressApproximate: search, city: value.city || search.split(",")[0] });
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-amber-200 bg-amber-50 p-3 flex gap-2 text-xs leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span className="text-amber-900"><span className="font-semibold">Privasi:</span> Untuk orang/hewan, alamat presisi tidak ditampilkan publik. Gunakan perkiraan area (mis. “Sekitar Taman Menteng”) dan hindari nomor rumah/lengkap.</span>
      </Card>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Label className="text-sm font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" /> Lokasi Kejadian</Label>
          <Button type="button" variant="outline" onClick={useMyLocation} className="rounded-full bg-white h-9">
            <LocateFixed className="w-4 h-4 mr-2" /> Gunakan lokasi saya
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input value={search} onChange={e=> setSearch(e.target.value)} placeholder="Cari alamat atau tempat (mis. Blok M, Jakarta)" className="pl-9 h-11 rounded-full bg-stone-50" aria-label="Cari lokasi" onKeyDown={e=> e.key==="Enter" && (e.preventDefault(), searchLocation())} />
          </div>
          <Button type="button" onClick={searchLocation} className="rounded-full h-11 px-5">Cari</Button>
        </div>

        {/* Map preview (lightweight) */}
        <div className="rounded-xl border overflow-hidden bg-stone-100 h-56 relative">
          {value.latitude && value.longitude ? (
            <iframe
              title="Peta lokasi"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${value.longitude-0.02}%2C${value.latitude-0.02}%2C${value.longitude+0.02}%2C${value.latitude+0.02}&layer=mapnik&marker=${value.latitude}%2C${value.longitude}`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-8 h-8 text-stone-400" />
              Peta akan tampil setelah koordinat diisi atau lokasi ditemukan
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs border shadow-sm flex items-center gap-1">
            <Info className="w-3 h-3" /> Geser peta tidak mengubah koordinat — ubah via input di bawah untuk presisi.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Latitude</Label><Input type="number" step="any" value={value.latitude ?? ""} onChange={e=> onChange({...value, latitude: parseFloat(e.target.value)||0})} className="mt-1 h-11 rounded-xl bg-white" placeholder="-6.2" /></div>
          <div><Label className="text-xs">Longitude</Label><Input type="number" step="any" value={value.longitude ?? ""} onChange={e=> onChange({...value, longitude: parseFloat(e.target.value)||0})} className="mt-1 h-11 rounded-xl bg-white" placeholder="106.8" /></div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label className="text-xs">Kota</Label><Input value={value.city || ""} onChange={e=> onChange({...value, city: e.target.value})} placeholder="Jakarta" className="mt-1 h-11 rounded-xl bg-white" /></div>
          <div><Label className="text-xs">Provinsi</Label><Input value={value.province || ""} onChange={e=> onChange({...value, province: e.target.value})} placeholder="DKI Jakarta" className="mt-1 h-11 rounded-xl bg-white" /></div>
        </div>
        <div>
          <Label className="text-xs">Alamat perkiraan (wajib)</Label>
          <Input value={value.addressApproximate || ""} onChange={e=> onChange({...value, addressApproximate: e.target.value})} placeholder="Contoh: Sekitar Jl. Sudirman, dekat Halte Blok M" className="mt-1 h-11 rounded-xl bg-white" />
          <p className="text-xs text-muted-foreground mt-1">Contoh baik: “Sekitar Pasar Minggu, Jakarta Selatan”. Hindari: “Jl. Mawar No. 10 RT 02”.</p>
        </div>
      </div>
    </div>
  );
}
