import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const dmSerif = DM_Serif_Display({ weight: ["400"], subsets: ["latin"], variable: "--font-dm-serif" });
const jakarta = Plus_Jakarta_Sans({ weight: ["300", "400", "500", "600"], subsets: ["latin"], variable: "--font-jetkana-sans" });

export const metadata: Metadata = {
  title: "TEMUKAN by AcaMedia - Bantu Temukan yang Hilang",
  description: "TEMUKAN by AcaMedia — platform gotong-royong untuk melaporkan dan menemukan orang, hewan, kendaraan, dokumen, dan barang hilang di sekitar Anda.",
  keywords: ["temukan", "temu", "acamedia", "barang hilang", "orang hilang", "hewan hilang"],
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={dmSerif.variable + " " + jakarta.variable + " h-full"}>
      <body className="min-h-full flex flex-col bg-background antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <BottomNav />
          <Toaster richColors />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
