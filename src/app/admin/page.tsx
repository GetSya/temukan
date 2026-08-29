import { auth } from "@/lib/auth";
import { getDataBin, getUsersBin, updateDataBin, updateUsersBin } from "@/services/jvault.service";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Flag, FileText, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage(){
  const session = await auth();
  if (!session?.user || session.user.email!=="admin@temu.id") redirect("/login");
  const bin = await getDataBin();
  const usersBin = await getUsersBin();

  async function handleModerate(formData: FormData){
    "use server";
    const id = formData.get("id") as string;
    const action = formData.get("action") as string;
    const bin = await getDataBin();
    if (action==="hide"){ const r = bin.reports.find(x=> x.id===id); if(r) r.status="ARCHIVED"; }
    if (action==="delete"){ bin.reports = bin.reports.filter(x=> x.id!==id); }
    if (action==="suspend"){ const users = await getUsersBin(); const u = users.users.find(x=> x.id===id); if(u) u.isSuspended=true; await updateUsersBin(users); }
    await updateDataBin(bin);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Admin Moderasi</h1>
          <p className="text-sm text-muted-foreground">Kelola laporan, pengguna, dan audit log secara bertanggung jawab.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <Card className="rounded-2xl p-5 text-center bg-white border-stone-200 shadow-soft"><div className="w-8 h-8 mx-auto rounded-full bg-stone-900 text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div><div className="text-2xl font-bold mt-2">{bin.reports.length}</div><div className="text-xs text-muted-foreground">Total Laporan</div></Card>
        <Card className="rounded-2xl p-5 text-center bg-white border-stone-200 shadow-soft"><div className="w-8 h-8 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center"><Flag className="w-4 h-4" /></div><div className="text-2xl font-bold mt-2">{bin.flags.length}</div><div className="text-xs text-muted-foreground">Laporan Abuse</div></Card>
        <Card className="rounded-2xl p-5 text-center bg-white border-stone-200 shadow-soft"><div className="w-8 h-8 mx-auto rounded-full bg-primary text-white flex items-center justify-center"><Users className="w-4 h-4" /></div><div className="text-2xl font-bold mt-2">{usersBin.users.length}</div><div className="text-xs text-muted-foreground">Total Pengguna</div></Card>
      </div>

      <h2 className="font-semibold mt-8 flex items-center gap-2"><Flag className="w-4 h-4" /> Laporan Abuse <Badge variant="secondary" className="rounded-full">{bin.flags.length}</Badge></h2>
      {bin.flags.length===0 ? <Card className="rounded-2xl border-dashed p-6 text-center mt-3 bg-white text-sm text-muted-foreground">Tidak ada laporan penyalahgunaan</Card> : (
        <div className="space-y-2 mt-3">
          {bin.flags.map(f=>(
            <Card key={f.id} className="rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white border-stone-200">
              <div className="text-sm min-w-0"><span className="font-mono text-xs bg-stone-100 rounded px-1.5 py-0.5">{f.reportId.slice(0,8)}</span> — {f.reason} <span className="text-xs text-muted-foreground">oleh {f.userId.slice(0,8)}</span></div>
              <form action={handleModerate} className="flex gap-2 shrink-0">
                <input type="hidden" name="id" value={f.reportId} />
                <Button name="action" value="hide" size="sm" variant="outline" className="rounded-full bg-white">Arsipkan</Button>
                <Button name="action" value="delete" size="sm" variant="destructive" className="rounded-full">Hapus</Button>
              </form>
            </Card>
          ))}
        </div>
      )}

      <h2 className="font-semibold mt-8">Semua Laporan (20 terbaru)</h2>
      <div className="space-y-2 mt-3">
        {bin.reports.slice(0,20).map(r=>(
          <Card key={r.id} className="rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between gap-3 bg-white border-stone-200">
            <div className="min-w-0"><div className="font-medium text-sm truncate">{r.title}</div><div className="text-xs text-muted-foreground capitalize">{r.category} • {r.status} • {r.location.city}</div></div>
            <form action={handleModerate} className="flex gap-1.5 shrink-0">
              <input type="hidden" name="id" value={r.id} />
              <Button name="action" value="hide" size="sm" variant="outline" className="rounded-full bg-white">Arsip</Button>
              <Button name="action" value="delete" size="sm" variant="destructive" className="rounded-full">Hapus</Button>
            </form>
          </Card>
        ))}
      </div>

      <h2 className="font-semibold mt-8">Pengguna</h2>
      <div className="space-y-2 mt-3">
        {usersBin.users.map(u=>(
          <Card key={u.id} className="rounded-2xl p-4 flex justify-between items-center bg-white border-stone-200">
            <div><div className="font-medium text-sm">{u.name} — {u.email}</div><div className="text-xs text-muted-foreground">{u.city} {u.isSuspended && <Badge variant="destructive" className="ml-2 rounded-full">ditangguhkan</Badge>}</div></div>
            {!u.isSuspended && (
              <form action={handleModerate}><input type="hidden" name="id" value={u.id} /><Button name="action" value="suspend" size="sm" variant="outline" className="rounded-full bg-white">Tangguhkan</Button></form>
            )}
          </Card>
        ))}
      </div>

      <h2 className="font-semibold mt-8">Audit Log (20 terbaru)</h2>
      <Card className="rounded-2xl p-4 mt-3 bg-white border-stone-200">
        <div className="space-y-1 max-h-64 overflow-auto text-xs">
          {bin.auditLogs.slice(-20).reverse().map(a=>(
            <div key={a.id} className="flex gap-2 border-b border-stone-100 py-2 last:border-0"><span className="text-muted-foreground shrink-0">{new Date(a.createdAt).toLocaleString("id-ID")}</span><span className="font-mono bg-stone-100 rounded px-1.5 py-0.5">{a.action}</span><span className="truncate">oleh {a.userId.slice(0,8)} → {a.targetId?.slice(0,8)}</span></div>
          ))}
          {bin.auditLogs.length===0 && <p className="text-muted-foreground">Belum ada aktivitas</p>}
        </div>
      </Card>
    </div>
  );
}
