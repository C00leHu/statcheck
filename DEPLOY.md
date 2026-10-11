# StatCheck — Production Deploy Runbook

Single-server, self-hosted deployment. Read fully before first deploy.

## 1. Secrets checklist

All secrets live in `.env.local` (production: `.env` / process-manager env — never in git).

| Variable | Required | Purpose |
|---|---|---|
| `SESSION_SECRET` | prod: yes | Signs session cookies. 32+ random chars. **Leak = forge any session → rotate immediately.** |
| `CRON_SECRET` | prod: yes | Bearer token for `POST /api/cron/check`. Random 32+ chars. |
| `BACKUP_KEY` | if backups | 64 hex chars (32 bytes). Encrypts backup files. **Losing it = backups unreadable.** |
| `DB_PATH` | optional | Defaults to `./data/statcheck.db`. Point at your persistent volume. |

Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Rules:
- `.env*` files: owner-only (`chmod 600`), app-only user, **excluded from backups** unless the backup itself is encrypted.
- Prefer injecting via systemd `EnvironmentFile=` (also `600`) or Docker secrets over a file in the project dir.
- Rotate on any suspected leak: new value → restart → all sessions/old cron callers stop working (that is the point).

## 2. File permissions

The app enforces these at startup on POSIX (see `lib/security/harden.ts`); verify on the host:

- `data/` → `700` (owner only — this alone blocks other users from the DB)
- `data/statcheck.db*`, `.env*` → `600`
- Backups dir → `700`
- Run the app as a dedicated non-root user. On Windows dev machines this is a no-op (ACLs differ) — production hardening assumes Linux.

## 3. Database & persistent volume

- SQLite lives at `DB_PATH`. It **must** be on a persistent volume (Docker volume / mounted disk), or redeploys wipe everything.
- WAL mode is on; keep `statcheck.db*` (db, -wal, -shm) together.
- No concurrent writers from multiple app instances — one instance per DB file (scale vertically, or move to Turso/Postgres first).

## 4. Run the app as a service

```ini
# /etc/systemd/system/statcheck.service
[Unit]
Description=StatCheck
After=network.target

[Service]
Type=simple
User=statcheck
WorkingDirectory=/opt/statcheck
EnvironmentFile=/opt/statcheck/.env
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Deploy flow on the server: copy the project (excluding `node_modules`, `.next`, `data/`), then as the `statcheck` user run `npm ci`, `npm run build`, and make sure `data/` is writable by that user (the app locks it to `700` itself). Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now statcheck
sudo systemctl status statcheck
journalctl -u statcheck -f   # logs
```

## 5. Scheduler (checks don't run themselves)

`POST /api/cron/check` must be called every minute, else monitors only update on manual clicks.

systemd timer example (adjust paths/user):

```ini
# /etc/systemd/system/statcheck-cron.service
[Service]
Type=oneshot
User=statcheck
EnvironmentFile=/opt/statcheck/.env
ExecStart=/usr/bin/curl -sf -X POST http://127.0.0.1:3000/api/cron/check -H "Authorization: Bearer ${CRON_SECRET}"
```

```ini
# /etc/systemd/system/statcheck-cron.timer
[Timer]
OnBootSec=1min
OnUnitActiveSec=1min
[Install]
WantedBy=timers.target
```

Alternative: any external cron service hitting the public URL with the same header.

## 6. Backups

```bash
node scripts/backup.mjs [--db <path>] [--out <dir>] [--keep 14]
```

- Consistent live snapshot (`VACUUM INTO`), AES-256-GCM encrypted, auto-prunes to newest 14. Run daily via scheduler.
- **Test restores quarterly** — an untested backup is not a backup:

```bash
node scripts/restore.mjs backups/statcheck-<stamp>.db.enc --db /tmp/restore-test.db --force
```

- Restore over live data: **stop the app first**, then `node scripts/restore.mjs <file> --force` (current DB is moved aside as `.pre-restore-<stamp>`, never deleted).
- Tampered/wrong-key files fail closed: GCM tag verification + `integrity_check` run before anything is touched.

## 7. Reverse proxy & TLS

Terminate TLS in front (Caddy example — auto-HTTPS):

```
statcheck.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

- `NODE_ENV=production` (enables Secure cookies, HSTS expectations, dev-only error details off).
- Firewall: expose 80/443 only; app port on loopback.
- Point the host at `GET /api/health` — returns 200 only when DB + secrets are healthy (`{"ok":true,…}`).

## 8. Updates & rollback

1. Backup first (`scripts/backup.mjs`).
2. Deploy new build, `npm run build`, restart.
3. Check `/api/health` → 200 and spot-check login + one monitor check.
4. Rollback = previous build + restore backup if the DB schema changed.

## 9. Incident response (security)

- **Suspected secret leak:** rotate the secret, restart, verify `/api/health`. Sessions signed with the old secret die instantly.
- **Suspected DB leak:** rotate both secrets, force all users to re-login (rotate `SESSION_SECRET`), assess scope, notify affected users per Art. 33–34 GDPR (see Privacy Policy).
- **Abuse (spam monitors, probing):** delete the account via DB or dashboard; rate limits are in-memory per instance.

## 10. GDPR operations

- Rights requests (access/erasure): dashboard covers self-serve deletion; handle email requests at the contact address within one month.
- No sub-processors currently (self-hosted, no email/analytics/payments) — update Privacy Policy the day that changes.
