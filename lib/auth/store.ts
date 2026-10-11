import { createHash } from "crypto";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { DatabaseSync } from "node:sqlite";
import { generateUserId } from "./crypto";
import { hardenPath } from "@/lib/security/harden";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  sessionVersion: number;
  createdAt: string;
}

// SQLite database (default: ./data/statcheck.db, override with DB_PATH).
// These access functions are the seam where another database can later be
// connected without touching the routes.
const DB_PATH = process.env.DB_PATH ?? join(process.cwd(), "data", "statcheck.db");

const g = global as unknown as { __scDb?: DatabaseSync };

function db(): DatabaseSync {
  if (!g.__scDb) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    hardenPath(dirname(DB_PATH), 0o700);
    const d = new DatabaseSync(DB_PATH);
    d.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email);
      CREATE TABLE IF NOT EXISTS recovery_codes (
        user_id TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        PRIMARY KEY (user_id, code_hash)
      );
      CREATE INDEX IF NOT EXISTS recovery_codes_user_idx ON recovery_codes(user_id);
    `);
    // Best-effort migration for databases created before this column existed.
    try {
      d.exec("ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0");
    } catch {
      /* column already exists */
    }
    // Owner-only on the DB file and its WAL/SHM siblings (dir 0700 already blocks others regardless).
    hardenPath(DB_PATH, 0o600);
    hardenPath(`${DB_PATH}-wal`, 0o600);
    hardenPath(`${DB_PATH}-shm`, 0o600);
    hardenPath(`${DB_PATH}-journal`, 0o600);
    g.__scDb = d;
  }
  return g.__scDb;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** SHA-256 of a recovery code. Codes are high-entropy random, shown once, never stored plain. */
export function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(code.replace(/[\s-]/g, "").toUpperCase()).digest("hex");
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  session_version: number | null;
  created_at: string;
}

function toUser(r: UserRow): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    passwordHash: r.password_hash,
    sessionVersion: r.session_version ?? 0,
    createdAt: r.created_at,
  };
}

const USER_COLS = "id, name, email, password_hash, session_version, created_at";

export function findUserByEmail(email: string): User | null {
  const row = db()
    .prepare(`SELECT ${USER_COLS} FROM users WHERE email = ?`)
    .get(normalizeEmail(email)) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function getUserById(id: string): User | null {
  const row = db()
    .prepare(`SELECT ${USER_COLS} FROM users WHERE id = ?`)
    .get(id) as UserRow | undefined;
  return row ? toUser(row) : null;
}

/** Returns null when the email is already taken. */
export function createUser(input: { name: string; email: string; passwordHash: string }): User | null {
  const now = new Date().toISOString();
  const id = generateUserId();
  try {
    db()
      .prepare("INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(id, input.name.trim(), normalizeEmail(input.email), input.passwordHash, now);
    return getUserById(id);
  } catch {
    return null;
  }
}

export function updateUserName(id: string, name: string): void {
  db().prepare("UPDATE users SET name = ? WHERE id = ?").run(name.trim().slice(0, 80), id);
}

/** Sets a new password hash and invalidates all existing sessions. */
export function resetPassword(id: string, passwordHash: string): void {
  db()
    .prepare("UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?")
    .run(passwordHash, id);
}

/** Stores fresh recovery codes (hashes only), replacing any existing ones. */
export function replaceRecoveryCodes(userId: string, codes: string[]): void {
  const d = db();
  const now = new Date().toISOString();
  d.exec("BEGIN IMMEDIATE");
  try {
    d.prepare("DELETE FROM recovery_codes WHERE user_id = ?").run(userId);
    const insert = d.prepare("INSERT INTO recovery_codes (user_id, code_hash, created_at) VALUES (?, ?, ?)");
    for (const code of codes) insert.run(userId, hashRecoveryCode(code), now);
    d.exec("COMMIT");
  } catch (err) {
    try {
      d.exec("ROLLBACK");
    } catch {}
    throw err;
  }
}

/** Verifies a recovery code and burns it (single use). Returns false for unknown/used codes. */
export function consumeRecoveryCode(userId: string, code: string): boolean {
  const res = db()
    .prepare("UPDATE recovery_codes SET used = 1 WHERE user_id = ? AND code_hash = ? AND used = 0")
    .run(userId, hashRecoveryCode(code));
  return res.changes > 0;
}

export function countUnusedRecoveryCodes(userId: string): number {
  return (db().prepare("SELECT COUNT(*) AS c FROM recovery_codes WHERE user_id = ? AND used = 0").get(userId) as { c: number }).c;
}

/** Deletes the user and all of their data (monitors, checks, incidents, pages, settings, codes). */
export function deleteUserAccount(id: string): void {
  const d = db();
  d.prepare("DELETE FROM checks WHERE monitor_id IN (SELECT id FROM monitors WHERE user_id = ?)").run(id);
  d.prepare("DELETE FROM monitors WHERE user_id = ?").run(id);
  d.prepare("DELETE FROM incident_updates WHERE incident_id IN (SELECT id FROM incidents WHERE user_id = ?)").run(id);
  d.prepare("DELETE FROM incidents WHERE user_id = ?").run(id);
  d.prepare("DELETE FROM status_pages WHERE user_id = ?").run(id);
  d.prepare("DELETE FROM user_settings WHERE user_id = ?").run(id);
  d.prepare("DELETE FROM recovery_codes WHERE user_id = ?").run(id);
  d.prepare("DELETE FROM users WHERE id = ?").run(id);
}
