export function avatarUrl(seed) {
  const s = encodeURIComponent(seed || "anon");
  // Deterministic SVG via dicebear (no uploads/buckets needed)
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${s}`;
}
