export type ShopStatus = {
  label: string;
  color: "green" | "red" | "gray";
};

/**
 * jam_buka format yang didukung:
 * - "08.00–17.00"
 * - "08:00-17:00"
 * - "08.00-17.00"
 * Jika format tidak dikenali -> "Info jam buka" (gray)
 */
export function getShopStatus(jam_buka?: string): ShopStatus {
  if (!jam_buka) return { label: "Info jam buka", color: "gray" };

  const s = jam_buka
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll(".", ":")
    .trim();

  const m = s.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return { label: "Info jam buka", color: "gray" };

  const sh = parseInt(m[1], 10);
  const sm = parseInt(m[2], 10);
  const eh = parseInt(m[3], 10);
  const em = parseInt(m[4], 10);

  if (
    !Number.isFinite(sh) ||
    !Number.isFinite(sm) ||
    !Number.isFinite(eh) ||
    !Number.isFinite(em)
  ) {
    return { label: "Info jam buka", color: "gray" };
  }

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  // asumsi jam buka tidak lewat tengah malam.
  const isOpen = nowMin >= startMin && nowMin <= endMin;

  return isOpen
    ? { label: "Buka", color: "green" }
    : { label: "Tutup", color: "red" };
}
