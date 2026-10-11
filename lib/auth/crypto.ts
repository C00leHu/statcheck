import { randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual, createHmac } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scryptCb);

export function generateUserId(): string {
  return randomBytes(12).toString("hex");
}

/** scrypt password hash in the form `scrypt$<salt>$<hash>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 32)) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hashHex) return false;
  const hash = (await scryptAsync(password, salt, 32)) as Buffer;
  const expected = Buffer.from(hashHex, "hex");
  if (hash.length !== expected.length) return false;
  return timingSafeEqual(hash, expected);
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function unb64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function getSessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set to a random 32+ char string in production.");
  }
  console.warn("[auth] SESSION_SECRET not set — using an ephemeral dev secret (sessions reset on restart).");
  const g = global as unknown as { __scDevSecret?: string };
  if (!g.__scDevSecret) g.__scDevSecret = randomBytes(32).toString("hex");
  return g.__scDevSecret;
}

/** Stateless HMAC-signed session token: base64url("<userId>.<exp>.<version>").<sig> */
export function signSessionToken(userId: string, maxAgeSec: number, version = 0): string {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const payload = `${userId}.${exp}.${version}`;
  const sig = b64url(createHmac("sha256", getSessionSecret()).update(payload).digest());
  return `${b64url(payload)}.${sig}`;
}

export function verifySessionToken(token: string): { userId: string; exp: number; version: number } | null {
  const [p, sig] = token.split(".");
  if (!p || !sig) return null;
  let payload: string;
  try {
    payload = unb64url(p).toString("utf8");
  } catch {
    return null;
  }
  const expected = b64url(createHmac("sha256", getSessionSecret()).update(payload).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  // Old-format tokens (no version segment) are rejected outright.
  const parts = payload.split(".");
  if (parts.length < 3) return null;
  const version = Number(parts.pop());
  const exp = Number(parts.pop());
  const userId = parts.join(".");
  if (!userId || !exp || exp < Date.now() / 1000 || !Number.isInteger(version)) return null;
  return { userId, exp, version };
}

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Human-friendly recovery codes like `K7Q2-X9MD`. Shown once, stored hashed. */
export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    let s = "";
    for (let j = 0; j < 8; j++) s += CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)];
    codes.push(`${s.slice(0, 4)}-${s.slice(4)}`);
  }
  return codes;
}
