// Encrypted SQLite backup: consistent snapshot via VACUUM INTO, then AES-256-GCM.
// Usage: node scripts/backup.mjs [--db <path>] [--out <dir>] [--keep <n>]
// Env:   DB_PATH (default ./data/statcheck.db), BACKUP_KEY (64 hex chars, required)
import { createCipheriv, randomBytes } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const DB = resolve(process.env.DB_PATH ?? arg("--db", join(process.cwd(), "data", "statcheck.db")));
const OUT = resolve(arg("--out", join(process.cwd(), "backups")));
const KEEP = Number(arg("--keep", "14")) || 14;

const keyHex = (process.env.BACKUP_KEY ?? "").trim();
if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
  console.error("BACKUP_KEY must be set to 64 hex chars (32 bytes). See .env.example.");
  process.exit(1);
}
const key = Buffer.from(keyHex, "hex");

const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15); // YYYYMMDDTHHMMSS
mkdirSync(OUT, { recursive: true });
const tmp = join(OUT, `.snapshot-${process.pid}.db`);
const dest = join(OUT, `statcheck-${stamp}.db.enc`);

try {
  // Transactionally consistent snapshot, safe while the app is running.
  const db = new DatabaseSync(DB);
  try {
    db.exec(`VACUUM INTO '${tmp.replace(/'/g, "''")}'`);
  } finally {
    db.close();
  }
  const plain = readFileSync(tmp);

  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  writeFileSync(dest, Buffer.concat([nonce, ct, tag]));

  // Prune oldest, keep the newest KEEP files.
  const encs = readdirSync(OUT)
    .filter((f) => f.startsWith("statcheck-") && f.endsWith(".db.enc"))
    .map((f) => ({ f, t: statSync(join(OUT, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  for (const old of encs.slice(KEEP)) unlinkSync(join(OUT, old.f));

  console.log(`backup ok: ${dest} (${plain.length} bytes snapshot, ${(readFileSync(dest).length)} bytes encrypted, keeping ${Math.min(KEEP, encs.length)})`);
} finally {
  rmSync(tmp, { force: true });
}
