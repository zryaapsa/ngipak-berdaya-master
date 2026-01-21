export function formatRupiah(value: number): string {
  const n = Number(value ?? 0);

  // kalau 0 dipakai untuk "custom/nego", kamu bisa ubah nanti.
  if (!Number.isFinite(n)) return "Rp0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}
