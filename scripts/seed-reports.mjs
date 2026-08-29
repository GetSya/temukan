import { randomUUID } from "crypto";

const BASE = "https://jvault.aerialstudio.tech";
const KEY = "jv_59c80af7ea55b398e7e4ebaeb14eb5d6dc88772dd7245a8cb432c1d7f16a";
const DATA_ID = "a3b993fe-3f68-445b-87b6-3fec8dd4e113";

const users = [
  "df2701e8-e977-44f6-befd-d94f3e71fb37", // andrerasya
  "c2729269-8431-490b-ba93-1132ace8a1e1", // kusantet
];

const categories = ["orang","hewan","kendaraan","dokumen","barang","lainnya"];
const titles = {
  orang: ["Anak hilang di Pasar Minggu", "Kakek 70th hilang di Bandung", "Remaja hilang sejak kemarin", "Ibu hilang di sekitar Terminal", "Balita terpisah di mall"],
  hewan: ["Kucing oren hilang Kebayoran", "Anjing husky hilang BSD", "Kucing anggora ditemukan di Kemang", "Burung parkit hilang Pamulang", "Kelinci putih hilang Bintaro"],
  kendaraan: ["Motor Beat hilang Cipete", "Mobil Avanza hilang parkiran", "Sepeda listrik ditemukan di stasiun", "Motor Vario hilang Fatmawati", "Mobil Brio hilang mall"],
  dokumen: ["Dompet berisi KTP hilang", "STNK motor hilang di parkiran", "Ijazah hilang saat pindah", "Paspor ditemukan di bandara", "KTM hilang kampus"],
  barang: ["Tas ransel hitam hilang KRL", "HP iPhone hilang di kafe", "Laptop Asus ditemukan di coworking", "Koper hilang stasiun Gambir", "Jam tangan hilang di gym"],
  lainnya: ["Kunci rumah hilang komplek", "Koper misterius ditemukan", "Payung tertinggal di halte", "Helm hilang parkiran", "Sepatu tertinggal masjid"],
};

const cities = [
  {city:"Jakarta Selatan", province:"DKI Jakarta", lat:-6.26, lng:106.80},
  {city:"Jakarta Pusat", province:"DKI Jakarta", lat:-6.18, lng:106.83},
  {city:"Bandung", province:"Jawa Barat", lat:-6.92, lng:107.61},
  {city:"Bekasi", province:"Jawa Barat", lat:-6.24, lng:107.00},
  {city:"Tangerang", province:"Banten", lat:-6.17, lng:106.64},
  {city:"Depok", province:"Jawa Barat", lat:-6.40, lng:106.82},
  {city:"Surabaya", province:"Jawa Timur", lat:-7.26, lng:112.75},
  {city:"Yogyakarta", province:"DI Yogyakarta", lat:-7.80, lng:110.36},
  {city:"Medan", province:"Sumatera Utara", lat:3.59, lng:98.67},
  {city:"Semarang", province:"Jawa Tengah", lat:-6.97, lng:110.42},
];

const descs = [
  "Mohon bantuan, terakhir terlihat kemarin sore sekitar jam 5. Ciri khusus ada di detail. Hubungi via chat atau kirim petunjuk.",
  "Kejadian sekitar area perumahan. Sudah dicari ke tetangga dan CCTV. Jika melihat, tolong foto dan kirim lokasi.",
  "Ditemukan dalam kondisi baik. Sudah diamankan. Pemilik bisa chat untuk verifikasi ciri.",
  "Hilang saat perjalanan pulang. Ada tanda khusus yang hanya pemilik tahu untuk verifikasi.",
  "Butuh bantuan komunitas, sudah lapor RT/RW. Terima kasih atas kepeduliannya.",
];

const imagesPool = [
  "https://iili.io/CpwWud7.webp",
  "https://picsum.photos/seed/temu1/800/600",
  "https://picsum.photos/seed/temu2/800/600",
  "https://picsum.photos/seed/temu3/800/600",
  "https://picsum.photos/seed/temu4/800/600",
  "https://picsum.photos/seed/temu5/800/600",
  "https://picsum.photos/seed/temu6/800/600",
  "https://picsum.photos/seed/temu7/800/600",
];

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

async function main(){
  // fetch existing
  const res = await fetch(`${BASE}/api/bins/${DATA_ID}`, { headers: { "X-API-Key": KEY }});
  if(!res.ok){ console.error("fetch data failed",res.status,await res.text()); process.exit(1); }
  const json = await res.json();
  const data = json.data ?? json;
  console.log("existing reports:", data.reports?.length);

  const now = Date.now();
  const newReports = [];
  for(let i=0;i<30;i++){
    const cat = categories[i % categories.length];
    const type = i % 3 === 0 ? "found" : "lost";
    const loc = pick(cities);
    const t = pick(titles[cat]);
    const d = pick(descs);
    const id = randomUUID();
    const userId = pick(users);
    const daysAgo = Math.floor(Math.random()*14);
    const dte = new Date(now - daysAgo*86400000);
    const status = i % 7 === 6 ? "FOUND" : "ACTIVE";
    newReports.push({
      id,
      userId,
      type,
      category: cat,
      title: `${t} #${i+2}`,
      description: `${d} Kategori ${cat}, ${type==="lost"?"hilang":"ditemukan"} di ${loc.city}. Detail tambahan laporan contoh ke-${i+2}.`,
      ciriCiri: `Ciri: ${cat} dengan tanda khusus contoh ${i+2}`,
      status,
      images: [pick(imagesPool)],
      location: {
        latitude: loc.lat + (Math.random()-0.5)*0.05,
        longitude: loc.lng + (Math.random()-0.5)*0.05,
        city: loc.city,
        province: loc.province,
        country: "Indonesia",
        addressApproximate: `Sekitar ${loc.city} dekat area ${i%2===0?"pasar":"halte"}`
      },
      eventDate: dte.toISOString().slice(0,10),
      eventTime: `${String(8+ i%10).padStart(2,"0")}:00`,
      createdAt: new Date(now - daysAgo*86400000 - Math.random()*3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      foundAt: status==="FOUND" ? new Date().toISOString() : null,
    });
  }

  const mergedReports = [...newReports, ...(data.reports||[])];
  const payload = {
    reports: mergedReports,
    reportTips: data.reportTips||[],
    notifications: data.notifications||[],
    savedReports: data.savedReports||[],
    flags: data.flags||[],
    categories: data.categories||[],
    auditLogs: [...(data.auditLogs||[]), { id: randomUUID(), action:"SEED_30_REPORTS", userId: users[0], targetId: "seed", createdAt: new Date().toISOString(), details: "Seed 30 laporan contoh" }],
  };

  const put = await fetch(`${BASE}/api/bins/${DATA_ID}`, {
    method:"PUT",
    headers:{ "X-API-Key": KEY, "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });
  if(!put.ok){ console.error("PUT failed",put.status, await put.text()); process.exit(1); }
  console.log("Seed sukses! Total reports sekarang:", mergedReports.length);
  console.log("Contoh terbaru:", newReports.slice(0,3).map(r=>`${r.category}/${r.type} - ${r.title} - ${r.location.city}`));
}

main().catch(e=>{ console.error(e); process.exit(1); });
