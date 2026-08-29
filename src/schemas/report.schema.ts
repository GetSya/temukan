import { z } from "zod";

export const reportSchema = z.object({
  type: z.enum(["lost", "found"]),
  category: z.enum(["orang", "hewan", "kendaraan", "dokumen", "barang", "lainnya"]),
  title: z.string().min(5, "Judul minimal 5 karakter").max(100),
  description: z.string().min(20, "Deskripsi minimal 20 karakter").max(2000),
  ciriCiri: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "FOUND", "CLOSED", "ARCHIVED"]).default("ACTIVE"),
  images: z.array(z.string().url()).max(10, "Maksimal 10 gambar").optional().default([]),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    city: z.string().min(1),
    province: z.string().min(1),
    country: z.string().default("Indonesia"),
    addressApproximate: z.string().min(1),
  }),
  eventDate: z.string().min(1, "Tanggal wajib diisi"),
  eventTime: z.string().optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

export const tipSchema = z.object({
  reportId: z.string().uuid(),
  message: z.string().min(10, "Pesan minimal 10 karakter").max(1000),
  location: z.string().optional(),
  seenAt: z.string().optional(),
  contact: z.string().optional(),
  image: z.string().url().optional().nullable(),
});

export type TipInput = z.infer<typeof tipSchema>;
