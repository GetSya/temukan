"use client";

import { Report, ReportCategory, ReportStatus, ReportType } from "@/types";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const PADDING = 60;
const CONTENT_WIDTH = CARD_WIDTH - PADDING * 2;

const CATEGORY_ICONS: Record<ReportCategory, string> = {
  orang: "👤",
  hewan: "🐾",
  kendaraan: "🚗",
  dokumen: "📄",
  barang: "📦",
  lainnya: "🔍",
};

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  orang: "Orang",
  hewan: "Hewan",
  kendaraan: "Kendaraan",
  dokumen: "Dokumen",
  barang: "Barang",
  lainnya: "Lainnya",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  ACTIVE: { label: "HILANG", color: "#DC2626", emoji: "🔴" },
  FOUND: { label: "DITEMUKAN", color: "#16A34A", emoji: "🟢" },
  CLOSED: { label: "SELESAI", color: "#6B7280", emoji: "✓" },
  DRAFT: { label: "DRAFT", color: "#9CA3AF", emoji: "📝" },
  ARCHIVED: { label: "DIARSIPKAN", color: "#6B7280", emoji: "📦" },
};

export interface ShareCardData {
  title: string;
  category: ReportCategory;
  status: ReportStatus;
  imageUrl: string;
  city: string;
  province: string;
  eventDate: string;
  reportUrl: string;
  type: ReportType;
}

function getStatusConfig(status: ReportStatus, type: ReportType) {
  if (status === "FOUND") return STATUS_CONFIG.FOUND;
  if (status === "CLOSED") return STATUS_CONFIG.CLOSED;
  if (status === "DRAFT") return STATUS_CONFIG.DRAFT;
  if (status === "ARCHIVED") return STATUS_CONFIG.ARCHIVED;
  return type === "lost" ? STATUS_CONFIG.ACTIVE : STATUS_CONFIG.FOUND;
}

function formatDateIndonesian(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  ctx.font = `${fontSize}px "Plus Jakarta Sans", sans-serif`;
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export async function generateShareCardCanvas(data: ShareCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#FAFAF9";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  gradient.addColorStop(0, "#FFFFFF");
  gradient.addColorStop(1, "#F5F5F4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const statusConfig = getStatusConfig(data.status, data.type);

  ctx.fillStyle = "#F5F5F4";
  ctx.beginPath();
  ctx.roundRect(PADDING, PADDING, CONTENT_WIDTH, CARD_HEIGHT - PADDING * 2, 24);
  ctx.fill();

  ctx.strokeStyle = "#E7E5E4";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(PADDING, PADDING, CONTENT_WIDTH, CARD_HEIGHT - PADDING * 2, 24);
  ctx.stroke();

  let y = PADDING + 40;

  ctx.fillStyle = "#1C1917";
  ctx.font = "bold 28px 'DM Serif Display', serif";
  ctx.textAlign = "left";
  const titleLines = wrapText(ctx, data.title, CONTENT_WIDTH - 100, 36);
  for (const line of titleLines.slice(0, 3)) {
    ctx.fillText(line, PADDING + 50, y);
    y += 44;
  }

  y += 16;

  const statusX = PADDING + 50;
  const statusWidth = ctx.measureText(`${statusConfig.emoji} ${statusConfig.label}`).width + 32;
  ctx.fillStyle = statusConfig.color;
  ctx.beginPath();
  ctx.roundRect(statusX - 8, y - 24, statusWidth, 40, 20);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`${statusConfig.emoji} ${statusConfig.label}`, statusX + 8, y + 2);
  y += 60;

  const categoryIcon = CATEGORY_ICONS[data.category] || "🔍";
  const categoryLabel = CATEGORY_LABELS[data.category] || data.category;
  ctx.fillStyle = "#57534E";
  ctx.font = "500 18px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`${categoryIcon} ${categoryLabel}`, PADDING + 50, y);
  y += 36;

  const locationText = `${data.city}${data.province ? `, ${data.province}` : ""}`;
  ctx.fillStyle = "#78716C";
  ctx.font = "400 16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`📍 ${locationText}`, PADDING + 50, y);
  y += 32;

  const dateText = formatDateIndonesian(data.eventDate);
  ctx.fillStyle = "#78716C";
  ctx.font = "400 16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`📅 ${dateText}`, PADDING + 50, y);
  y += 40;

  ctx.strokeStyle = "#E7E5E4";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING + 50, y);
  ctx.lineTo(PADDING + CONTENT_WIDTH - 50, y);
  ctx.stroke();
  y += 20;

  try {
    const img = await loadImage(data.imageUrl);
    const imgSize = Math.min(280, CARD_HEIGHT - y - 80);
    const imgX = CARD_WIDTH - PADDING - 50 - imgSize;
    const imgY = y + 10;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, imgSize, imgSize, 16);
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
    ctx.restore();

    ctx.fillStyle = "#F5F5F4";
    ctx.beginPath();
    ctx.roundRect(imgX - 4, imgY - 4, imgSize + 8, imgSize + 8, 20);
    ctx.strokeStyle = "#E7E5E4";
    ctx.lineWidth = 2;
    ctx.stroke();
  } catch (e) {
    console.warn("Failed to load image for share card:", e);
    ctx.fillStyle = "#F5F5F4";
    ctx.beginPath();
    const placeholderSize = Math.min(280, CARD_HEIGHT - y - 80);
    const placeholderX = CARD_WIDTH - PADDING - 50 - placeholderSize;
    const placeholderY = y + 10;
    ctx.roundRect(placeholderX, placeholderY, placeholderSize, placeholderSize, 16);
    ctx.fill();
    ctx.fillStyle = "#D6D3D1";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📷", placeholderX + placeholderSize / 2, placeholderY + placeholderSize / 2 + 8);
    ctx.textAlign = "left";
  }

  const bottomY = CARD_HEIGHT - PADDING - 40;

  ctx.fillStyle = "#1C1917";
  ctx.font = "bold 14px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("TEMUKAN by AcaMedia", PADDING + 50, bottomY);

  ctx.fillStyle = "#78716C";
  ctx.font = "400 13px 'Plus Jakarta Sans', sans-serif";
  const urlText = data.reportUrl;
  const maxUrlWidth = CARD_WIDTH - PADDING * 2 - 100;
  const urlLines = wrapText(ctx, urlText, maxUrlWidth, 13);
  for (const line of urlLines.slice(0, 2)) {
    ctx.fillText(line, PADDING + 50, bottomY + 22);
  }

  return canvas;
}

export async function generateShareCardBlob(data: ShareCardData): Promise<Blob> {
  const canvas = await generateShareCardCanvas(data);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, "image/png", 0.95);
  });
}

export async function downloadShareCard(data: ShareCardData, filename?: string) {
  const canvas = await generateShareCardCanvas(data);
  const link = document.createElement("a");
  link.download = filename || `temukan-share-${data.title.slice(0, 20).replace(/[^a-z0-9]/gi, "-")}.png`;
  link.href = canvas.toDataURL("image/png", 0.95);
  link.click();
}

export function buildWhatsAppMessage(data: ShareCardData): string {
  const statusConfig = getStatusConfig(data.status, data.type);
  const locationText = `${data.city}${data.province ? `, ${data.province}` : ""}`;
  const dateText = formatDateIndonesian(data.eventDate);
  return `${statusConfig.emoji} ${data.title.toUpperCase()}\n📍 ${locationText}\n📅 ${dateText}\n\nMohon bantu sebarkan informasi ini.\nLihat detail: ${data.reportUrl}`;
}

export function buildTelegramUrl(data: ShareCardData): string {
  const text = encodeURIComponent(buildWhatsAppMessage(data));
  return `https://t.me/share/url?url=${encodeURIComponent(data.reportUrl)}&text=${text}`;
}

export function buildFacebookUrl(data: ShareCardData): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.reportUrl)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
}

export async function nativeShare(data: ShareCardData): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({
      title: data.title,
      text: buildWhatsAppMessage(data),
      url: data.reportUrl,
    });
    return true;
  } catch {
    return false;
  }
}

export async function incrementShareCount(reportId: string): Promise<void> {
  try {
    await fetch(`/api/reports/${reportId}/share`, { method: "POST" });
  } catch (e) {
    console.warn("Failed to increment share count:", e);
  }
}

export function prepareShareCardData(report: Report, baseUrl: string): ShareCardData {
  return {
    title: report.title,
    category: report.category,
    status: report.status,
    imageUrl: report.images[0] || "https://picsum.photos/seed/temu-default/800/600",
    city: report.location.city,
    province: report.location.province,
    eventDate: report.eventDate,
    reportUrl: `${baseUrl}/reports/${report.id}`,
    type: report.type,
  };
}