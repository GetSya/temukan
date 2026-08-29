import { Suspense } from "react";
import { SearchClient } from "./client";

export default function SearchPage(){
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold">Cari Laporan</h1>
      <Suspense fallback={<div className="mt-4 p-4">Memuat...</div>}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
