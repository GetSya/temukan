"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useState } from "react";
import { Report } from "@/types";
import { Bookmark, BookmarkCheck, CheckCircle2, Flag, MessageCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReportShareCard } from "@/components/share/report-share-card";

export function ReportActions({ report }: { report: Report }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [showFoundDialog, setShowFoundDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagSending, setFlagSending] = useState(false);
  const [foundLoading, setFoundLoading] = useState(false);

  const alreadyFound = report.status === "FOUND";

  async function handleSave(){
    if (!session?.user){ toast.error("Masuk dulu untuk menyimpan"); return; }
    const res = await fetch("/api/saved", { method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ reportId: report.id })});
    if (res.ok){ setSaved(true); toast.success("Disimpan ke daftar Anda"); } else toast.error("Gagal menyimpan");
  }
  async function submitFlag(){
    if (!session?.user){ toast.error("Masuk dulu"); return; }
    if (!flagReason.trim() || flagReason.trim().length < 5) { toast.error("Alasan minimal 5 karakter"); return; }
    setFlagSending(true);
    const res = await fetch("/api/flags", { method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ reportId: report.id, reason: flagReason.trim() })});
    setFlagSending(false);
    if (res.ok) { toast.success("Laporan diteruskan ke admin, terima kasih"); setShowFlagDialog(false); setFlagReason(""); }
    else {
      const j = await res.json().catch(()=>({}));
      toast.error(j.error || "Gagal melaporkan");
    }
  }
  async function confirmFound(){
    setFoundLoading(true);
    const res = await fetch(`/api/reports/${report.id}`, { method:"PATCH", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ status:"FOUND" })});
    const j = await res.json().catch(()=>({}));
    setFoundLoading(false);
    if (res.ok) {
      toast.success("Laporan ditandai sudah ditemukan");
      setShowFoundDialog(false);
      router.refresh();
      setTimeout(()=> location.reload(), 600);
    } else {
      const msg = j.error ? (typeof j.error === "string" ? j.error : JSON.stringify(j.error)) : `Gagal (${res.status})`;
      if (res.status === 403) toast.error("Gagal: hanya pemilik laporan atau admin yang bisa menandai sudah ditemukan");
      else toast.error(msg);
    }
  }

  async function handleChat(){
    if (!session?.user){ toast.error("Masuk dulu untuk chat"); return; }
    if ((session.user as any).id === report.userId) { toast.error("Ini laporan Anda sendiri"); return; }
    setChatting(true);
    const res = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ otherUserId: report.userId, reportId: report.id }),
    });
    const j = await res.json().catch(()=>({}));
    setChatting(false);
    if (!res.ok) { toast.error(j.error || "Gagal memulai chat"); return; }
    router.push(`/chat?id=${j.conversation.id}`);
  }

  return (
    <>
      <Card className="rounded-2xl border-stone-200 shadow-soft p-4 bg-white space-y-2">
        <Button onClick={handleChat} disabled={chatting} className="w-full rounded-full h-11 font-medium">
          <MessageCircle className="w-4 h-4 mr-2" /> {chatting ? "Membuka..." : "Chat Pemilik"}
        </Button>
        <Button onClick={handleSave} variant="outline" className="w-full rounded-full h-11 bg-white justify-center">
          {saved ? <BookmarkCheck className="w-4 h-4 mr-2 text-emerald-600" /> : <Bookmark className="w-4 h-4 mr-2" />}
          {saved?"Tersimpan":"Simpan"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <ReportShareCard report={report} />
          <Button onClick={()=> setShowFlagDialog(true)} variant="ghost" className="rounded-full h-11"><Flag className="w-4 h-4 mr-2" /> Laporkan</Button>
        </div>
        <Button onClick={()=> setShowFoundDialog(true)} disabled={alreadyFound} variant="outline" className={`w-full rounded-full h-11 font-medium ${alreadyFound ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white"}`}>
          <CheckCircle2 className="w-4 h-4 mr-2" /> {alreadyFound ? "Sudah Ditandai Ditemukan" : "Tandai Sudah Ditemukan"}
        </Button>
        <p className="text-xs text-muted-foreground text-center leading-relaxed">Chat aman, jangan bagikan data sensitif. Tombol terakhir hanya untuk pemilik.</p>
      </Card>

      {/* Tandai Ditemukan Dialog */}
      <Dialog open={showFoundDialog} onOpenChange={setShowFoundDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Tandai sudah ditemukan?</DialogTitle>
            <DialogDescription className="text-left leading-relaxed">
              Laporan <span className="font-medium text-foreground">"{report.title}"</span> akan diubah statusnya menjadi <span className="font-medium text-emerald-700">Sudah Ditemukan</span> dan tampil di bagian "Sudah Ditemukan" di beranda. Pastikan informasi sudah benar.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs flex gap-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>Hanya pemilik laporan atau admin yang bisa melakukan ini. Jika bukan pemilik, Anda akan melihat pesan "Forbidden".</span>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={()=> setShowFoundDialog(false)} disabled={foundLoading} className="rounded-full">Batal</Button>
            <Button onClick={confirmFound} disabled={foundLoading} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
              {foundLoading ? "Memproses..." : "Ya, tandai ditemukan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Laporkan Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Flag className="w-5 h-5 text-red-600" /> Laporkan penyalahgunaan</DialogTitle>
            <DialogDescription>Bantu jaga komunitas. Jelaskan alasan pelaporan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="flag-reason">Alasan *</Label>
            <Textarea id="flag-reason" value={flagReason} onChange={e=> setFlagReason(e.target.value)} placeholder="Contoh: spam, data palsu, foto tidak relevan, dll." rows={3} className="rounded-xl" />
            <p className="text-xs text-muted-foreground">Minimal 5 karakter</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={()=> setShowFlagDialog(false)} disabled={flagSending} className="rounded-full">Batal</Button>
            <Button onClick={submitFlag} disabled={flagSending} className="rounded-full">
              {flagSending ? "Mengirim..." : "Kirim Laporan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
