export function toErrMessage(e: unknown): string {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;

  // Supabase error biasanya object { message, details, hint, code }
  const anyE = e as Record<string, unknown>;
  const msg = typeof anyE.message === "string" ? anyE.message : "";
  const details = typeof anyE.details === "string" ? anyE.details : "";
  const hint = typeof anyE.hint === "string" ? anyE.hint : "";
  const code = typeof anyE.code === "string" ? anyE.code : "";

  return [msg, details, hint, code].filter(Boolean).join(" • ") || JSON.stringify(e);
}
