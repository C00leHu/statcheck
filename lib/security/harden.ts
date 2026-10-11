import { chmodSync, existsSync, statSync } from "fs";

/**
 * Restrict a file or directory to owner-only access (POSIX).
 * On Windows ACLs work differently, so this is a documented no-op there —
 * production file permissions are covered in DEPLOY.md instead.
 * Never throws: hardening must not break the app.
 */
export function hardenPath(path: string, mode: 0o700 | 0o600): void {
  try {
    if (process.platform === "win32") return;
    if (!existsSync(path)) return;
    if ((statSync(path).mode & 0o777) !== mode) chmodSync(path, mode);
  } catch (err) {
    console.warn(`[security] could not restrict permissions on ${path}: ${err instanceof Error ? err.message : err}`);
  }
}
