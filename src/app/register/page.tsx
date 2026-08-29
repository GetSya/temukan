"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterPage(){
  const [form, setForm] = useState({ name:"", email:"", password:"", city:"" });
  const [loading,setLoading]=useState(false);
  const router = useRouter();
  async function onSubmit(e:React.FormEvent){
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", { method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify(form) });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) toast.error(j.error ? JSON.stringify(j.error): j.error);
    else { toast.success("Akun berhasil dibuat — silakan masuk"); router.push("/login"); }
  }
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <img src="/logo.png" alt="TEMUKAN" className="h-10 mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">Buat akun untuk mulai membantu komunitas</p>
      </div>
      <Card className="rounded-2xl border-stone-200 shadow-soft bg-white">
        <CardHeader><CardTitle className="text-xl">Daftar akun</CardTitle><CardDescription>Gratis dan cepat — hanya butuh email dan kata sandi</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label htmlFor="name">Nama lengkap</Label><Input id="name" value={form.name} onChange={e=> setForm({...form, name:e.target.value})} required className="mt-1 h-11 rounded-xl" placeholder="Budi Santoso" autoComplete="name" /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={e=> setForm({...form, email:e.target.value})} required className="mt-1 h-11 rounded-xl" placeholder="nama@email.com" autoComplete="email" /></div>
            <div><Label htmlFor="password">Kata sandi</Label><Input id="password" type="password" value={form.password} onChange={e=> setForm({...form, password:e.target.value})} required className="mt-1 h-11 rounded-xl" placeholder="Minimal 6 karakter" autoComplete="new-password" /><p className="text-xs text-muted-foreground mt-1">Minimal 6 karakter</p></div>
            <div><Label htmlFor="city">Kota (opsional)</Label><Input id="city" value={form.city} onChange={e=> setForm({...form, city:e.target.value})} placeholder="Jakarta" className="mt-1 h-11 rounded-xl" /></div>
            <Button type="submit" disabled={loading} className="w-full rounded-full h-11 font-medium">{loading?"Memproses...":"Daftar"}</Button>
            <p className="text-sm text-center">Sudah punya akun? <Link href="/login" className="font-medium text-primary hover:underline">Masuk</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
