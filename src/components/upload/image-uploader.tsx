"use client";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2, Star, AlertCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

type Props = { value: string[]; onChange: (urls: string[]) => void; max?: number };

export function ImageUploader({ value, onChange, max = 10 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const uploadFiles = useCallback(async (files: File[]) => {
    const remaining = max - value.length;
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) { toast.error(`Maksimal ${max} gambar`); return; }
    const errs: string[] = [];
    for (const file of toUpload) {
      if (!["image/jpeg","image/png","image/webp","image/jpg"].includes(file.type)) { errs.push(`${file.name}: Format harus JPG/PNG/WebP`); continue; }
      if (file.size > 5*1024*1024) { errs.push(`${file.name}: Maksimal 5 MB`); continue; }
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload/image", { method:"POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal upload");
        onChange([...value, data.url]);
        toast.success("Foto berhasil diunggah");
      } catch (e:any) {
        errs.push(`${file.name}: ${e.message}`);
      } finally { setUploading(false); }
    }
    setErrors(errs);
    if (errs.length) errs.forEach(m=> toast.error(m));
  }, [value, onChange, max]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  }

  function setPrimary(idx: number) {
    if (idx===0) return;
    const copy = [...value];
    const [item] = copy.splice(idx,1);
    copy.unshift(item);
    onChange(copy);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e)=>{e.preventDefault(); setDragOver(true);}}
        onDragLeave={()=> setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-4 text-center transition ${dragOver ? "border-primary bg-primary/5" : "border-stone-200 bg-stone-50/50 hover:bg-stone-50"}`}
      >
        <div className="mx-auto w-10 h-10 rounded-full bg-white border flex items-center justify-center">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-stone-600" />}
        </div>
        <p className="text-sm font-medium mt-2">Seret & lepas foto di sini</p>
        <p className="text-xs text-muted-foreground">atau klik untuk memilih</p>
        <label className="mt-3 inline-flex">
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e)=> e.target.files && uploadFiles(Array.from(e.target.files))} aria-label="Pilih foto" />
          <span className="bg-white border rounded-full px-4 py-2 text-sm font-medium hover:bg-stone-50 cursor-pointer inline-flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Pilih foto
          </span>
        </label>
        <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP • Maks 5 MB per foto • Maks {max} foto</p>
      </div>

      {value.length>0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, idx)=>(
            <div key={url+idx} className={`group relative aspect-square rounded-xl overflow-hidden border bg-white ${idx===0 ? "ring-2 ring-primary border-primary" : "border-stone-200"}`}>
              <img src={url} alt={`Foto ${idx+1}`} loading="lazy" className="w-full h-full object-cover" />
              {idx===0 && <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Utama</span>}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
              <div className="absolute top-1.5 right-1.5 flex gap-1">
                <button type="button" aria-label={`Hapus foto ${idx+1}`} onClick={()=> onChange(value.filter((_,i)=>i!==idx))} className="bg-white/90 backdrop-blur rounded-full p-1.5 hover:bg-white border shadow-sm min-h-8 min-w-8 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {idx!==0 && (
                <button type="button" onClick={()=> setPrimary(idx)} className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur text-xs px-2 py-1 rounded-full border shadow-sm hover:bg-white">Jadikan utama</button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className={value.length>=max ? "text-amber-600 font-medium" : "text-muted-foreground"}>{value.length}/{max} foto terunggah {value.length>=max && "• Maksimum tercapai"}</span>
        {value.length>0 && idxPrimaryHint(value)}
      </div>

      {errors.length>0 && (
        <Card className="rounded-xl border-amber-200 bg-amber-50 p-3 text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <ul className="space-y-1">
            {errors.map((e,i)=><li key={i}>{e}</li>)}
          </ul>
        </Card>
      )}
    </div>
  );
}

function idxPrimaryHint(value: string[]) {
  if (value.length===0) return null;
  return <span className="text-muted-foreground">Foto pertama akan jadi sampul</span>;
}
