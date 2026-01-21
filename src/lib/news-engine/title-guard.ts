function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.split(' ').filter(Boolean));
  const setB = new Set(b.split(' ').filter(Boolean));
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection += 1;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function isNearDuplicateTitle(candidate: string, source: string): boolean {
  const a = normalizeTitle(candidate);
  const b = normalizeTitle(source);
  if (!a || !b) return false;
  if (a === b) return true;
  const similarity = jaccardSimilarity(a, b);
  return similarity >= 0.9;
}

export function buildDistinctTitle(input: {
  summary?: string | null;
  category?: string | null;
  fallback: string;
}): string {
  const rawSummary = (input.summary ?? '').trim();
  const base = rawSummary
    ? rawSummary.split(/[.!?]/)[0]?.trim() || rawSummary
    : input.fallback.trim();

  const clipped = base.length > 140 ? `${base.slice(0, 137).trim()}…` : base;
  const prefix = (input.category ?? '').trim();
  const composed = `${prefix ? `${prefix}: ` : ''}${clipped}`.trim();

  return composed || input.fallback.trim();
}
