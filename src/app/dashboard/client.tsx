"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Report } from "@/types";
import { ReportCard } from "@/components/report/report-card";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Eye, Pencil, Trash2, Bookmark, Bell, Inbox, User, CheckCircle2 } from "lucide-react";
import { relativeTime } from "@/lib/time";

export function DashboardClient({ myReports, savedReports, myTips, notifs, initialTab }: any){
  const [tab, setTab] = useState(initialTab);

  async function handleDelete(id:string){
    if (!confirm("Hapus laporan ini? Tindakan tidak bisa dibatalkan.")) return;
    const res = await fetch(`/api/reports/${id}`, { method:"DELETE"});
    if (res.ok){ toast.success("Laporan dihapus"); location.reload(); } else toast.error("Gagal menghapus");
  }
  async function markRead(id:string){
    await fetch("/api/notifications", { method:"PATCH", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ id })});
    location.reload();
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="mt-6">
      <TabsList className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-full w-fit">
        <TabsTrigger value="reports" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Laporan Saya</TabsTrigger>
        <TabsTrigger value="saved" className="rounded-full data-[state=active]:bg-white px-4">Tersimpan</TabsTrigger>
        <TabsTrigger value="tips" className="rounded-full data-[state=active]:bg-white px-4">Petunjuk Masuk</TabsTrigger>
        <TabsTrigger value="notif" className="rounded-full data-[state=active]:bg-white px-4">Notifikasi</TabsTrigger>
        <TabsTrigger value="profile" className="rounded-full data-[state=active]:bg-white px-4">Profil</TabsTrigger>
      </TabsList>

      <TabsContent value="reports" className="space-y-3 mt-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{myReports.length} laporan</p>
          <Link href="/report"><Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Buat Laporan Baru</Button></Link>
        </div>
        {myReports.length===0 ? (
          <Card className="rounded-2xl border-dashed p-8 text-center bg-white">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center"><Inbox className="w-6 h-6 text-stone-500" /></div>
            <p className="font-medium mt-3">Belum ada laporan</p>
            <p className="text-sm text-muted-foreground">Buat laporan pertama agar komunitas bisa membantu.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {myReports.map((r:Report)=>(
              <Card key={r.id} className="rounded-2xl border-stone-200 shadow-soft p-4 flex gap-4 items-center justify-between bg-white">
                <div className="flex gap-3 items-center min-w-0">
                  <img src={r.images[0]||"https://via.placeholder.com/80"} className="w-16 h-16 object-cover rounded-xl border shrink-0" alt="" loading="lazy" />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="rounded-full text-xs h-5">{r.status==="ACTIVE"?"Aktif":r.status==="FOUND"?"Sudah Ditemukan":r.status}</Badge>
                      <span className="capitalize">{r.category}</span> • {relativeTime(r.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0 flex-col sm:flex-row">
                  <Link href={`/reports/${r.id}`}><Button variant="outline" size="sm" className="rounded-full bg-white w-full sm:w-auto"><Eye className="w-4 h-4 mr-1" /> Lihat</Button></Link>
                  <Link href={`/report/${r.id}/edit`}><Button variant="outline" size="sm" className="rounded-full bg-white w-full sm:w-auto"><Pencil className="w-4 h-4 mr-1" /> Ubah</Button></Link>
                  <Button variant="ghost" size="sm" onClick={()=> handleDelete(r.id)} className="rounded-full text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-1" /> Hapus</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="saved" className="mt-4">
        {savedReports.length===0 ? (
          <Card className="rounded-2xl border-dashed p-8 text-center bg-white">
            <Bookmark className="w-8 h-8 mx-auto text-stone-400" />
            <p className="font-medium mt-2">Belum ada laporan tersimpan</p>
            <p className="text-sm text-muted-foreground">Simpan laporan untuk dilihat nanti.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {savedReports.map((r:Report)=> <ReportCard key={r.id} report={r} />)}
          </div>
        )}
      </TabsContent>

      <TabsContent value="tips" className="mt-4">
        {myTips.length===0 ? (
          <Card className="rounded-2xl border-dashed p-8 text-center bg-white">
            <Inbox className="w-8 h-8 mx-auto text-stone-400" />
            <p className="font-medium mt-2">Belum ada petunjuk</p>
            <p className="text-sm text-muted-foreground">Petunjuk dari komunitas akan muncul di sini.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {myTips.map((t:any)=>(
              <Card key={t.id} className="rounded-2xl border-stone-200 p-4 bg-white">
                <div className="text-sm leading-relaxed">{t.message}</div>
                <div className="text-xs text-muted-foreground mt-1">Laporan: {t.reportId} • {new Date(t.createdAt).toLocaleString("id-ID")}</div>
                {t.contact && <div className="text-xs mt-1">Kontak: {t.contact}</div>}
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="notif" className="mt-4">
        {notifs.length===0 ? (
          <Card className="rounded-2xl border-dashed p-8 text-center bg-white">
            <Bell className="w-8 h-8 mx-auto text-stone-400" />
            <p className="font-medium mt-2">Tidak ada notifikasi</p>
            <p className="text-sm text-muted-foreground">Notifikasi tentang petunjuk baru akan tampil di sini.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifs.map((n:any)=>(
              <Card key={n.id} className={`rounded-2xl p-4 flex justify-between gap-3 bg-white border-stone-200 ${!n.read?"border-primary/30 bg-primary/5":""}`}>
                <div className="flex gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.read?"bg-stone-100":"bg-primary text-white"}`}>{n.read ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}</span>
                  <div>
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{n.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString("id-ID")}</div>
                  </div>
                </div>
                {!n.read && <Button size="sm" variant="outline" className="rounded-full bg-white h-8 shrink-0" onClick={()=> markRead(n.id)}>Tandai dibaca</Button>}
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="profile" className="mt-4">
        <Card className="rounded-2xl p-6 bg-white border-stone-200">
          <h3 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Profil</h3>
          <p className="text-sm text-muted-foreground mt-1">Kelola nama, kota, dan avatar. Data disimpan di Users BIN JVault. Fitur edit profil lengkap akan hadir — untuk sekarang perbarui via API atau hubungi admin.</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
