import { ImageResponse } from "next/og";
import { getDataBin } from "@/services/jvault.service";
import { Report, ReportCategory, ReportStatus, ReportType } from "@/types";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

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

function wrapTextForOg(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > maxChars && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3);
}

export default async function getOgImage(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bin = await getDataBin();
  const report = bin.reports.find((r) => r.id === id);

  if (!report) {
    return new Response("Report not found", { status: 404 });
  }

  const statusConfig = getStatusConfig(report.status, report.type);
  const categoryIcon = CATEGORY_ICONS[report.category] || "🔍";
  const categoryLabel = CATEGORY_LABELS[report.category] || report.category;
  const locationText = `${report.location.city}${report.location.province ? `, ${report.location.province}` : ""}`;
  const dateText = formatDateIndonesian(report.eventDate);
  const reportUrl = `${process.env.NEXTAUTH_URL || "https://temukan.app"}/reports/${report.id}`;

  const titleLines = wrapTextForOg(report.title, 50);

  return new ImageResponse(
    (
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FAFAF9",
          fontFamily: "system-ui, sans-serif",
          padding: 60,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#F5F5F4",
            borderRadius: 24,
            border: "1px solid #E7E5E4",
            padding: 40,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {titleLines.map((line, i) => (
                <div key={i} style={{ fontSize: 36, fontWeight: 700, color: "#1C1917", lineHeight: 1.2, fontFamily: "Georgia, serif" }}>
                  {line}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: statusConfig.color,
                  borderRadius: 20,
                  padding: "8px 16px",
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                <span style={{ marginRight: 8 }}>{statusConfig.emoji}</span>
                {statusConfig.label}
              </div>
            </div>

            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 18,
                  fontWeight: 500,
                  color: "#57534E",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                <span>{categoryIcon}</span>
                <span>{categoryLabel}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 16,
                  color: "#78716C",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                <span>📍</span>
                <span>{locationText}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 16,
                  color: "#78716C",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                <span>📅</span>
                <span>{dateText}</span>
              </div>
            </div>

            <div style={{ marginTop: 20, borderTop: "1px solid #E7E5E4", paddingTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1C1917",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                TEMUKAN by AcaMedia
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#78716C",
                  fontFamily: "system-ui, sans-serif",
                  wordBreak: "break-all",
                }}
              >
                {reportUrl}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      fonts: [
        {
          name: "system-ui",
          data: Buffer.from(""),
          style: "normal",
        },
      ],
    }
  );
}