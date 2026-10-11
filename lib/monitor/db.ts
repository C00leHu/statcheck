import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { DatabaseSync } from "node:sqlite";
import { hardenPath } from "@/lib/security/harden";

const DB_PATH = process.env.DB_PATH ?? join(process.cwd(), "data", "statcheck.db");

const g = global as unknown as { __scProductDb?: DatabaseSync };

/** Shared SQLite handle for product tables (monitors, checks, incidents, pages, settings). */
export function productDb(): DatabaseSync {
  if (!g.__scProductDb) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    hardenPath(dirname(DB_PATH), 0o700);
    const d = new DatabaseSync(DB_PATH);
    d.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS monitors (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        target TEXT NOT NULL,
        interval_seconds INTEGER NOT NULL DEFAULT 300,
        timeout_seconds INTEGER NOT NULL DEFAULT 10,
        status TEXT NOT NULL DEFAULT 'unknown',
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS monitors_user_idx ON monitors(user_id);
      CREATE TABLE IF NOT EXISTS checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monitor_id TEXT NOT NULL,
        ok INTEGER NOT NULL,
        status_code INTEGER,
        response_ms INTEGER,
        error TEXT,
        checked_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS checks_monitor_idx ON checks(monitor_id, checked_at);
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'investigating',
        monitor_ids TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS incidents_user_idx ON incidents(user_id);
      CREATE TABLE IF NOT EXISTS incident_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS incident_updates_inc_idx ON incident_updates(incident_id);
      CREATE TABLE IF NOT EXISTS status_pages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL DEFAULT '',
        monitor_ids TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS status_pages_user_idx ON status_pages(user_id);
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY,
        alert_email INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS webhook_endpoints (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS webhook_endpoints_user_idx ON webhook_endpoints(user_id);
      CREATE TABLE IF NOT EXISTS webhook_deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint_id TEXT NOT NULL,
        event TEXT NOT NULL,
        ok INTEGER NOT NULL,
        status_code INTEGER,
        error TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS webhook_deliveries_ep_idx ON webhook_deliveries(endpoint_id, created_at);
    `);
    // Best-effort migration for databases created before this column existed.
    try {
      d.exec("ALTER TABLE user_settings ADD COLUMN onboarding_done INTEGER NOT NULL DEFAULT 0");
    } catch {
      /* column already exists */
    }
    hardenPath(DB_PATH, 0o600);
    hardenPath(`${DB_PATH}-wal`, 0o600);
    hardenPath(`${DB_PATH}-shm`, 0o600);
    hardenPath(`${DB_PATH}-journal`, 0o600);
    g.__scProductDb = d;
  }
  return g.__scProductDb;
}
