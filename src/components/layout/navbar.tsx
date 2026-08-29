"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, Bell, LayoutDashboard, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [notifCount, setNotifCount] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);
  useEffect(() => {
    if (session?.user) {
      fetch("/api/notifications").then(r=>r.json()).then(d=>{
        setNotifCount(d.notifications?.filter((n:any)=>!n.read).length || 0)
      }).catch(()=>{});
      fetch("/api/chat/conversations").then(r=>r.json()).then(d=>{
        const total = (d.conversations || []).reduce((acc:number, c:any)=> acc + (c.unread||0), 0);
        setChatUnread(total);
      }).catch(()=>{});
      const iv = setInterval(()=> {
        fetch("/api/chat/conversations").then(r=>r.json()).then(d=>{
          const total = (d.conversations || []).reduce((acc:number, c:any)=> acc + (c.unread||0), 0);
          setChatUnread(total);
        }).catch(()=>{});
      }, 5000);
      return ()=> clearInterval(iv);
    }
  }, [session]);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 h-[64px] flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 min-w-0" aria-label="Beranda TEMUKAN">
          <img src="/logo.png" alt="TEMUKAN" className="h-9 w-auto object-contain shrink-0" />
          <span className="hidden lg:block text-[11px] leading-tight font-medium text-muted-foreground border-l pl-3">
            Bantu Temukan<br/>yang Hilang <span className="text-[10px] font-normal">by AcaMedia</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center flex-1 max-w-[420px] mx-6">
          <Link href="/search" className="w-full group" aria-label="Cari laporan">
            <div className="flex items-center gap-3 bg-stone-100 group-hover:bg-stone-200/70 transition rounded-full px-4 py-[10px] border border-transparent group-hover:border-stone-200">
              <Search className="w-4 h-4 text-stone-500 shrink-0" />
              <span className="text-sm text-stone-500 truncate">Cari orang, hewan, barang, dokumen…</span>
              <span className="ml-auto hidden xl:inline text-xs bg-white border rounded-full px-2.5 py-1 text-stone-500">Tekan / untuk cari</span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-1.5 shrink-0" aria-label="Navigasi utama">
          <Link href="/search" className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Cari" className="rounded-full min-h-11 min-w-11">
              <Search className="w-5 h-5" />
            </Button>
          </Link>

          {session?.user ? (
            <>
              <Link href="/report" className="hidden sm:block">
                <Button className="rounded-full px-5 h-10 font-medium shadow-soft"> 
                  <Plus className="w-4 h-4 mr-1.5" /> Buat Laporan
                </Button>
              </Link>
              <Link href="/report" className="sm:hidden">
                <Button size="icon" aria-label="Buat laporan" className="rounded-full min-h-11 min-w-11"><Plus className="w-5 h-5" /></Button>
              </Link>
              <Link href="/chat" aria-label={`Pesan ${chatUnread ? chatUnread + ' belum dibaca' : ''}`}>
                <Button variant="ghost" size="icon" className="rounded-full relative min-h-11 min-w-11">
                  <MessageCircle className="w-5 h-5" />
                  {chatUnread>0 && <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[11px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-medium">{chatUnread>9?'9+':chatUnread}</span>}
                </Button>
              </Link>
              <Link href="/dashboard" aria-label={`Notifikasi ${notifCount ? notifCount + ' belum dibaca' : ''}`}>
                <Button variant="ghost" size="icon" className="rounded-full relative min-h-11 min-w-11">
                  <Bell className="w-5 h-5" />
                  {notifCount>0 && <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[11px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-medium">{notifCount>9?'9+':notifCount}</span>}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger aria-label="Menu pengguna" className="rounded-full focus-visible:ring-2 focus-visible:ring-ring ml-1">
                  <Avatar className="w-9 h-9 border border-stone-200"><AvatarFallback className="bg-stone-900 text-white text-sm">{session.user.name?.[0] || "U"}</AvatarFallback></Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem><Link href="/chat" className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Pesan {chatUnread>0 && `(${chatUnread})`}</Link></DropdownMenuItem>
                  <DropdownMenuItem><Link href="/dashboard" className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem><Link href="/dashboard?tab=saved">Tersimpan</Link></DropdownMenuItem>
                  <DropdownMenuItem><Link href="/dashboard?tab=profile">Profil</Link></DropdownMenuItem>
                  {session.user.email==="admin@temu.id" && <DropdownMenuItem><Link href="/admin">Admin</Link></DropdownMenuItem>}
                  <DropdownMenuItem onClick={()=>signOut()} className="text-red-600">Keluar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" className="rounded-full h-10 px-5">Masuk</Button></Link>
              <Link href="/register"><Button className="rounded-full h-10 px-5 font-medium">Daftar</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
