// Restore an encrypted backup created by scripts/backup.mjs.
// Usage: node scripts/restore.mjs <backup-file> [--db <path>] [--force]
// Verifies authenticity (GCM tag) and SQLite integrity before touching anything.
// Stop the app first. Without --force, refuses to overwrite an existing database.
import { createDecipheriv } from "node:crypto";
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/restore.mjs <backup-file> [--db <path>] [--force]");
  process.exit(1);
}
function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const DB = resolve(process.env.DB_PATH ?? arg("--db", join(process.cwd(), "data", "statcheck.db")));
const force = process.argv.includes("--force");

const keyHex = (process.env.BACKUP_KEY ?? "").trim();
if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
  console.error("BACKUP_KEY must be set to 64 hex chars (32 bytes). See .env.example.");
  process.exit(1);
}

const blob = readFileSync(resolve(file));
if (blob.length < 12 + 16 + 1) {
  console.error("Backup file too small — not a valid backup.");
  process.exit(1);
}
const nonce = blob.subarray(0, 12);
const tag = blob.subarray(blob.length - 16);
const ct = blob.subarray(12, blob.length - 16);

let plain;
try {
  const decipher = createDecipheriv("aes-256-gcm", Buffer.from(keyHex, "hex"), nonce);
  decipher.setAuthTag(tag);
  plain = Buffer.concat([decipher.update(ct), decipher.final()]);
} catch {
  console.error("Decryption failed: wrong BACKUP_KEY or tampered file. Nothing was changed.");
  process.exit(1);
}

const tmp = `${DB}.restore-${process.pid}.tmp`;
writeFileSync(tmp, plain);
try {
  const check = new DatabaseSync(tmp, { readOnly: true });
  try {
    const row = check.prepare("PRAGMA integrity_check").get();
    if (!row || row.integrity_check !== "ok") throw new Error(`integrity_check: ${row?.integrity_check}`);
    const tables = check.prepare("SELECT COUNT(*) AS c FROM sqlite_master WHERE type='table'").get();
    console.log(`backup verified: integrity ok, ${tables.c} tables`);
  } finally {
    check.close();
  }
} catch (err) {
  rmSync(tmp, { force: true });
  console.error(`Backup is not a valid database: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}

if (existsSync(DB) && !force) {
  rmSync(tmp, { force: true });
  console.error("A database already exists at the target. Re-run with --force to replace it (current file is kept as .pre-restore-<timestamp>).");
  process.exit(1);
}
if (existsSync(DB)) {
  const aside = `${DB}.pre-restore-${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}`;
  renameSync(DB, aside);
  console.log(`current database moved aside: ${aside}`);
  rmSync(`${DB}-wal`, { force: true });
  rmSync(`${DB}-shm`, { force: true });
  rmSync(`${DB}-journal`, { force: true });
}
renameSync(tmp, DB);
console.log(`restored: ${DB}`);
