export type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, boolean | undefined>;
export function clsx(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const v of inputs) {
    if (!v) continue;
    if (typeof v === "string" || typeof v === "number") out.push(String(v));
    else if (Array.isArray(v)) out.push(clsx(...v));
    else if (typeof v === "object") {
      for (const [k, on] of Object.entries(v)) if (on) out.push(k);
    }
  }
  return out.join(" ");
}
