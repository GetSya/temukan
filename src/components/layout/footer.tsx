"use client";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/chat")) return null;
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TEMUKAN" className="h-8 w-auto" />
            <span className="font-bold tracking-tight">TEMUKAN <span className="font-normal text-muted-foreground">by AcaMedia</span></span>
          </div>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-md text-balance">TEMUKAN by AcaMedia — platform komunitas untuk membantu menemukan yang hilang — orang, hewan, kendaraan, dokumen, dan barang. Dibangun dengan prinsip kepercayaan, privasi, dan gotong royong.</p>
        </div>
        <div>
          <h4 className="font-semibold">Jelajahi</h4>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><a href="/search" className="hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring rounded">Cari Laporan</a></li>
            <li><a href="/report" className="hover:text-foreground">Buat Laporan</a></li>
            <li><a href="/dashboard" className="hover:text-foreground">Dashboard</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Kepercayaan</h4>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>Privasi lokasi dijaga</li>
            <li>Moderasi komunitas</li>
            <li>Tidak menampilkan alamat presisi untuk orang/hewan</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-200 py-4 text-center text-xs text-muted-foreground">© 2026 TEMUKAN by AcaMedia • Bantu Temukan yang Hilang • Dibuat dengan Next.js & JVault</div>
    </footer>
  );
}
