import { User as LucideUser, PawPrint, Car, FileText, Package, Search as SearchIcon, LucideIcon } from "lucide-react";

export type ReportType = "lost" | "found";
export type ReportCategory = "orang" | "hewan" | "kendaraan" | "dokumen" | "barang" | "lainnya";
export type ReportStatus = "DRAFT" | "ACTIVE" | "FOUND" | "CLOSED" | "ARCHIVED";

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  province: string;
  country: string;
  addressApproximate: string;
}

export interface Report {
  id: string;
  userId: string;
  type: ReportType;
  category: ReportCategory;
  title: string;
  description: string;
  status: ReportStatus;
  images: string[];
  location: LocationData;
  eventDate: string;
  eventTime: string;
  createdAt: string;
  updatedAt: string;
  foundAt: string | null;
  ciriCiri?: string;
  contactHidden?: boolean;
  shareCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string | null;
  city: string;
  createdAt: string;
  updatedAt: string;
  role?: "user" | "admin";
  isSuspended?: boolean;
}

export interface ReportTip {
  id: string;
  reportId: string;
  userId: string | null;
  message: string;
  location?: string;
  seenAt?: string;
  contact?: string;
  image?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  reportId?: string;
  createdAt: string;
}

export interface SavedReport {
  id: string;
  userId: string;
  reportId: string;
  createdAt: string;
}

export interface Flag {
  id: string;
  reportId: string;
  userId: string;
  reason: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: ReportCategory;
  icon: string;
  count?: number;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  targetId?: string;
  details?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[]; // [userId, userId]
  reportId?: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface ChatBin {
  conversations: ChatConversation[];
  messages: ChatMessage[];
}

export interface DataBin {
  reports: Report[];
  reportTips: ReportTip[];
  notifications: Notification[];
  savedReports: SavedReport[];
  flags: Flag[];
  categories: Category[];
  auditLogs: AuditLog[];
}

export interface UsersBin {
  users: User[];
}

export const CATEGORIES: { label: string; value: ReportCategory; icon: LucideIcon; desc: string }[] = [
  { label: "Orang", value: "orang", icon: LucideUser, desc: "Orang hilang/ditemukan" },
  { label: "Hewan", value: "hewan", icon: PawPrint, desc: "Hewan peliharaan" },
  { label: "Kendaraan", value: "kendaraan", icon: Car, desc: "Motor, mobil, sepeda" },
  { label: "Dokumen", value: "dokumen", icon: FileText, desc: "KTP, STNK, ijazah" },
  { label: "Barang", value: "barang", icon: Package, desc: "Barang berharga" },
  { label: "Lainnya", value: "lainnya", icon: SearchIcon, desc: "Objek lain" },
];

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Aktif",
  FOUND: "Sudah Ditemukan",
  CLOSED: "Ditutup",
  ARCHIVED: "Diarsipkan",
};

export function categoryLabel(cat: ReportCategory): string {
  return CATEGORIES.find(c=>c.value===cat)?.label || cat;
}
