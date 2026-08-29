"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) toast.error("Gagal masuk — periksa email dan kata sandi");
    else { toast.success("Selamat datang kembali"); router.push("/dashboard"); }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <img src="/logo.png" alt="TEMUKAN" className="h-10 mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">Masuk untuk mengelola laporan Anda</p>
      </div>
      <Card className="rounded-2xl border-stone-200 shadow-soft bg-white">
        <CardHeader>
          <CardTitle className="text-xl">Masuk ke TEMUKAN</CardTitle>
          <CardDescription>Gunakan email dan kata sandi akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e=> setEmail(e.target.value)} required className="mt-1 h-11 rounded-xl" placeholder="nama@email.com" autoComplete="email" /></div>
            <div><Label htmlFor="password">Kata sandi</Label><Input id="password" type="password" value={password} onChange={e=> setPassword(e.target.value)} required className="mt-1 h-11 rounded-xl" placeholder="••••••••" autoComplete="current-password" /></div>
            <Button type="submit" disabled={loading} className="w-full rounded-full h-11 font-medium">{loading?"Memproses...":"Masuk"}</Button>
            <p className="text-sm text-center">Belum punya akun? <Link href="/register" className="font-medium text-primary hover:underline">Daftar</Link></p>
          </form>
        </CardContent>
      </Card>
      <p className="text-xs text-center text-muted-foreground mt-4">Dengan masuk, Anda menyetujui privasi lokasi dijaga untuk kategori orang & hewan.</p>
    </div>
  );
}
