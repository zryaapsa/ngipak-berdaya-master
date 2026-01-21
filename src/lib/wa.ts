export function normalizeWaNumber(input: string): string {
  const raw = String(input ?? "").trim();

  // buang semua selain digit
  let digits = raw.replace(/[^\d]/g, "");

  // kalau diawali 0 -> ubah ke 62
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);

  // kalau diawali +62 -> jadi 62 (karena + sudah dibuang, ini aman)
  // kalau sudah 62 biarkan
  return digits;
}

/**
 * Buat link WhatsApp "click to chat".
 * noWa bisa "08xxx", "+62xxx", "62xxx".
 * message optional.
 */
export function toWaLink(noWa: string, message?: string): string {
  const phone = normalizeWaNumber(noWa);
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone}${text}`;
}
