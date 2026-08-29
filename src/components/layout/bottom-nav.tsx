"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", icon: Home, label: "Beranda" },
  { href: "/search", icon: Search, label: "Cari" },
  { href: "/report", icon: PlusCircle, label: "Buat" },
  { href: "/chat", icon: MessageCircle, label: "Pesan" },
  { href: "/dashboard?tab=profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi bawah" className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-stone-200 flex justify-around py-1.5 md:hidden z-40 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
      {items.map((it) => {
        const active = pathname===it.href || (it.href==="/dashboard?tab=profile" && pathname==="/dashboard");
        return (
          <Link key={it.href} href={it.href} className={cn("flex flex-col items-center justify-center gap-1 min-w-11 min-h-11 px-2 py-1 rounded-xl focus-visible:ring-2 focus-visible:ring-ring", active ? "text-primary" : "text-stone-500")}>
            <it.icon className={cn("w-5 h-5", active && "fill-primary/10")} aria-hidden />
            <span className="text-[10px] font-medium leading-none">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
