import { Report } from "@/types";
import { haversine } from "./geo";

export function similarityScore(a: Report, b: Report): number {
  if (a.id === b.id) return 0;
  let score = 0;
  if (a.category === b.category) score += 30;
  if (a.type === b.type) score += 10;

  // keyword overlap
  const wordsA = new Set(a.title.toLowerCase().split(/\W+/).concat(a.description.toLowerCase().split(/\W+/)));
  const wordsB = new Set(b.title.toLowerCase().split(/\W+/).concat(b.description.toLowerCase().split(/\W+/)));
  let overlap = 0;
  wordsA.forEach((w) => {
    if (w.length > 2 && wordsB.has(w)) overlap++;
  });
  score += Math.min(overlap * 5, 30);

  // location proximity
  const dist = haversine(a.location.latitude, a.location.longitude, b.location.latitude, b.location.longitude);
  if (dist < 5) score += 20;
  else if (dist < 20) score += 10;
  else if (dist < 50) score += 5;

  // time proximity
  const t1 = new Date(a.eventDate).getTime();
  const t2 = new Date(b.eventDate).getTime();
  const diffDays = Math.abs(t1 - t2) / (1000 * 60 * 60 * 24);
  if (diffDays < 3) score += 10;
  else if (diffDays < 7) score += 5;

  return score;
}

export function findSimilar(reports: Report[], target: Report, limit = 4): Report[] {
  return reports
    .map((r) => ({ r, score: similarityScore(target, r) }))
    .filter((x) => x.score > 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.r);
}
