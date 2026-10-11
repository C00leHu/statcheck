// Tiny in-memory rate limiter for auth endpoints (single instance).
// Returns the seconds to wait when the limit is exceeded, or 0 when allowed.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): number {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return 0;
  }
  if (entry.count >= limit) {
    return Math.ceil((entry.resetAt - now) / 1000);
  }
  entry.count += 1;
  return 0;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
