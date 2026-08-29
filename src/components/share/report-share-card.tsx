"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Report } from "@/types";
import {
  generateShareCardCanvas,
  generateShareCardBlob,
  downloadShareCard,
  buildWhatsAppMessage,
  buildTelegramUrl,
  buildFacebookUrl,
  copyToClipboard,
  nativeShare,
  incrementShareCount,
  prepareShareCardData,
} from "@/services/share-card.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Share2, MessageSquare, Send, Copy, Download, ExternalLink, Loader2, Check, X, Smartphone, Globe, Wifi } from "lucide-react";
import { toast } from "sonner";

interface ReportShareCardProps {
  report: Report;
  baseUrl?: string;
}

export function ReportShareCard({ report, baseUrl = "" }: ReportShareCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);

  const shareData = useMemo(
    () => prepareShareCardData(report, baseUrl || (typeof window !== "undefined" ? window.location.origin : "")),
    [report, baseUrl]
  );

  const generatePreview = useCallback(async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateShareCardCanvas(shareData);
      canvasRef.current = canvas;
      const dataUrl = canvas.toDataURL("image/png", 0.95);
      setShareCardUrl(dataUrl);
    } catch (e) {
      console.error("Failed to generate share card:", e);
      toast.error("Gagal membuat kartu share");
    } finally {
      setIsGenerating(false);
    }
  }, [shareData]);

  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  const handleWhatsApp = async () => {
    setSharing("whatsapp");
    try {
      const message = buildWhatsAppMessage(shareData);
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      await incrementShareCount(report.id);
      toast.success("Membuka WhatsApp...");
    } catch {
      toast.error("Gagal membuka WhatsApp");
    } finally {
      setSharing(null);
    }
  };

  const handleTelegram = async () => {
    setSharing("telegram");
    try {
      const url = buildTelegramUrl(shareData);
      window.open(url, "_blank", "noopener,noreferrer");
      await incrementShareCount(report.id);
      toast.success("Membuka Telegram...");
    } catch {
      toast.error("Gagal membuka Telegram");
    } finally {
      setSharing(null);
    }
  };

  const handleFacebook = async () => {
    setSharing("facebook");
    try {
      const url = buildFacebookUrl(shareData);
      window.open(url, "_blank", "noopener,noreferrer");
      await incrementShareCount(report.id);
      toast.success("Membuka Facebook...");
    } catch {
      toast.error("Gagal membuka Facebook");
    } finally {
      setSharing(null);
    }
  };

  const handleCopyLink = async () => {
    const url = shareData.reportUrl;
    const success = await copyToClipboard(url);
    if (success) {
      setCopySuccess(true);
      toast.success("✓ Link berhasil disalin");
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      toast.error("Gagal menyalin link");
    }
    await incrementShareCount(report.id);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadShareCard(shareData);
      toast.success("Kartu share berhasil diunduh");
      await incrementShareCount(report.id);
    } catch {
      toast.error("Gagal mengunduh kartu share");
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    setSharing("native");
    try {
      const shared = await nativeShare(shareData);
      if (shared) {
        toast.success("Berhasil dibagikan");
        await incrementShareCount(report.id);
      } else {
        await handleCopyLink();
      }
    } catch {
      await handleCopyLink();
    } finally {
      setSharing(null);
    }
  };

  const [copying, setCopying] = useState(false);

  const wrappedCopyLink = async () => {
    setCopying(true);
    await handleCopyLink();
    setCopying(false);
  };

  const shareButtons = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageSquare,
      color: "bg-green-600 hover:bg-green-700",
      iconColor: "text-green-600",
      onClick: handleWhatsApp,
      disabled: sharing !== null,
      loading: sharing === "whatsapp",
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: Send,
      color: "bg-blue-600 hover:bg-blue-700",
      iconColor: "text-blue-600",
      onClick: handleTelegram,
      disabled: sharing !== null,
      loading: sharing === "telegram",
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: Globe,
      color: "bg-blue-700 hover:bg-blue-800",
      iconColor: "text-blue-700",
      onClick: handleFacebook,
      disabled: sharing !== null,
      loading: sharing === "facebook",
    },
    {
      id: "copy",
      label: copySuccess ? "Tersalin ✓" : "Copy Link",
      icon: Copy,
      color: copySuccess ? "bg-emerald-600" : "bg-stone-900 hover:bg-stone-800",
      iconColor: copySuccess ? "text-white" : "text-stone-900",
      onClick: wrappedCopyLink,
      disabled: copying || sharing !== null,
      loading: copying,
    },
    {
      id: "download",
      label: "Download PNG",
      icon: Download,
      color: "bg-amber-600 hover:bg-amber-700",
      iconColor: "text-amber-600",
      onClick: handleDownload,
      disabled: downloading || sharing !== null,
      loading: downloading,
    },
    {
      id: "native",
      label: "Bagikan Native",
      icon: Share2,
      color: "bg-primary hover:bg-primary/90",
      iconColor: "text-primary",
      onClick: handleNativeShare,
      disabled: sharing !== null || !navigator.share,
      loading: sharing === "native",
    },
  ];

  return (
    <Sheet>
      <SheetTrigger className="rounded-full h-11 bg-white min-w-[120px] justify-center inline-flex items-center gap-2 border border-stone-200 text-sm font-medium text-foreground hover:bg-stone-50 transition-colors">
        <Share2 className="w-4 h-4" /> Bagikan
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md rounded-2xl p-0 overflow-hidden" side="bottom">
        <SheetHeader className="px-6 py-4 border-b border-stone-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold">Bagikan Laporan</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-0.5">
                Sebarkan informasi untuk membantu menemukan
              </SheetDescription>
            </div>
            <SheetClose className="rounded-full p-1 hover:bg-stone-100 transition-colors" aria-label="Tutup">
              <X className="w-5 h-5" />
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="p-6 bg-white">
          {isGenerating ? (
            <div className="aspect-[1200/630] bg-stone-100 rounded-xl flex flex-col items-center justify-center gap-3 animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Membuat kartu share...</span>
            </div>
          ) : shareCardUrl ? (
            <div className="relative aspect-[1200/630] rounded-xl overflow-hidden border border-stone-200 bg-white">
              <img
                ref={previewImgRef}
                src={shareCardUrl}
                alt={`Share card untuk ${report.title}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="aspect-[1200/630] bg-stone-100 rounded-xl flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Share2 className="w-10 h-10 text-stone-300" />
              <span className="text-sm">Gagal memuat preview</span>
            </div>
          )}

          <Separator className="my-5" />

          <div className="grid grid-cols-3 gap-3">
            {shareButtons.slice(0, 3).map((btn) => (
              <Button
                key={btn.id}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className={`${btn.color} text-white rounded-xl h-14 min-h-[44px] flex flex-col items-center justify-center gap-1.5 transition-all`}
                aria-label={btn.label}
              >
                <btn.icon className={`${btn.iconColor} w-5 h-5`} />
                <span className="text-xs font-medium leading-tight">{btn.loading ? "..." : btn.label}</span>
                {btn.loading && <Loader2 className="w-4 h-4 animate-spin" />}
              </Button>
            ))}
            {shareButtons.slice(3, 6).map((btn) => (
              <Button
                key={btn.id}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className={`${btn.color} text-white rounded-xl h-14 min-h-[44px] flex flex-col items-center justify-center gap-1.5 transition-all`}
                aria-label={btn.label}
              >
                <btn.icon className={`${btn.iconColor} w-5 h-5`} />
                <span className="text-xs font-medium leading-tight">{btn.loading ? "..." : btn.label}</span>
                {btn.loading && <Loader2 className="w-4 h-4 animate-spin" />}
              </Button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-stone-200">
            <Button
              variant="ghost"
              onClick={() => {}}
              className="w-full rounded-xl h-12 text-muted-foreground hover:text-foreground"
            >
              Tutup
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ShareButtonConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  iconColor: string;
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}