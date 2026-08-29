"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function TipForm({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ message:"", location:"", seenAt:"", contact:"" });

  async function submit(e: React.FormEvent){
    e.preventDefault();
    if (form.message.length<10){ toast.error("Pesan minimal 10 karakter"); return; }
    setLoading(true);
    const res = await fetch("/api/tips", { method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ reportId, ...form })});
    const j = await res.json();
    setLoading(false);
    if (!res.ok) toast.error(j.error ? JSON.stringify(j.error): "Gagal mengirim");
    else { toast.success("Terima kasih! Informasi Anda telah dikirim dan pemilik akan mendapat notifikasi."); setForm({message:"",location:"",seenAt:"",contact:""}); }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <Label htmlFor="tip-message" className="text-xs">Pesan <span className="text-red-600">*</span></Label>
        <Textarea id="tip-message" value={form.message} onChange={e=> setForm({...form, message:e.target.value})} rows={3} placeholder="Contoh: Saya melihat kucing mirip di Jl. Mawar dekat Alfamart jam 8 pagi..." className="mt-1 rounded-xl" aria-required />
        <p className="text-xs text-muted-foreground mt-1">Minimal 10 karakter</p>
      </div>
      <div>
        <Label htmlFor="tip-location" className="text-xs">Lokasi melihat (opsional)</Label>
        <Input id="tip-location" value={form.location} onChange={e=> setForm({...form, location:e.target.value})} placeholder="Sekitar ..." className="mt-1 h-11 rounded-xl" />
      </div>
      <div>
        <Label htmlFor="tip-seenAt" className="text-xs">Waktu melihat (opsional)</Label>
        <Input id="tip-seenAt" type="datetime-local" value={form.seenAt} onChange={e=> setForm({...form, seenAt:e.target.value})} className="mt-1 h-11 rounded-xl" />
      </div>
      <div>
        <Label htmlFor="tip-contact" className="text-xs">Kontak opsional</Label>
        <Input id="tip-contact" value={form.contact} onChange={e=> setForm({...form, contact:e.target.value})} placeholder="WhatsApp atau email (tidak ditampilkan publik tanpa izin)" className="mt-1 h-11 rounded-xl" />
      </div>
      <Button type="submit" disabled={loading} className="w-full rounded-full h-11 font-medium">{loading?"Mengirim...":"Kirim Informasi"}</Button>
      <p className="text-xs text-muted-foreground text-center">Data Anda dijaga privasinya. Hanya pemilik laporan yang menerima notifikasi.</p>
    </form>
  );
}
