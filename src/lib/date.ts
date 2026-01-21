/**
 * Format tanggal Indonesia.
 * Input ideal: "YYYY-MM-DD"
 * Output: "20 Jan 2026" (id-ID)
 */
export function formatTanggalID(ymd: string): string {
  if (!ymd) return "-";

  // aman untuk format YYYY-MM-DD
  const [y, m, d] = ymd.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return ymd;

  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return ymd;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
}
