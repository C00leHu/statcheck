# StatCheck

Self-hosted uptime monitoring with public status pages. Monitor services over HTTP(S) and TCP, track incidents with public timelines, and give your users a live status page — all on your own server, with your own SQLite database.

## Features

- **Uptime monitoring** — HTTP, HTTPS, and TCP checks with intervals from 1 minute; every check records status, latency, and history
- **Public status pages** — one clean page per project at your own `/s/` URL
- **Incident management** — create incidents, post structured updates, keep a permanent timeline
- **90-day uptime history** — computed from recorded checks; days without data are shown as such, never faked
- **Alert webhooks** — outage and recovery alerts via Discord, Slack, or any JSON webhook, with per-endpoint delivery logs
- **Response-time tracking** — per-monitor latency graphs and averages
- **API-first** — every dashboard action runs through the same JSON API the UI uses
- **No sub-processors** — self-hosted, no email / analytics / payment vendors by default

## Stack

Next.js 14 (App Router) · React 18 · Tailwind CSS · TypeScript · SQLite via built-in `node:sqlite` (no native addons, no separate DB server).

## Requirements

- Node.js ≥ 22.13 (24 LTS recommended — this repo is developed on Node 24)
- A scheduler that can hit an HTTP endpoint every minute (systemd timer, cron, or any external cron service)

## Quickstart

```bash
npm install
cp .env.example .env.local   # then fill in SESSION_SECRET (and CRON_SECRET)
npm run dev                  # http://localhost:3000
```

Open the app, sign up, add a monitor — the first check runs within seconds.

### Environment

| Variable | Required | Purpose |
|---|---|---|
| `SESSION_SECRET` | prod: yes | 32+ random chars. Signs session cookies. |
| `CRON_SECRET` | prod: yes | Bearer token for `POST /api/cron/check`. Random 32+ chars. |
| `BACKUP_KEY` | if backups | 64 hex chars (32 bytes). Encrypts backup files. **Losing it = backups unreadable.** |
| `DB_PATH` | optional | Defaults to `./data/statcheck.db`. |

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

See `.env.example` for details. Never commit real secrets — `.env` and `.env*.local` are gitignored.

### Scheduler (required for automatic checks)

Monitors only update on manual clicks unless something calls the check endpoint every minute:

```bash
curl -X POST http://localhost:3000/api/cron/check \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Backups

```bash
node scripts/backup.mjs [--db <path>] [--out <dir>] [--keep 14]
```

Takes a transactionally consistent snapshot (`VACUUM INTO`), encrypts it with AES-256-GCM, and prunes to the newest 14. Test restores quarterly — an untested backup is not a backup:

```bash
node scripts/restore.mjs backups/statcheck-<stamp>.db.enc --db /tmp/restore-test.db --force
```

## Project structure

```
app/            # Next.js App Router — pages, API routes, layouts
  api/          # auth, monitors, incidents, status-pages, webhooks, cron, health, …
  s/            # public status pages (/s/[slug])
  dashboard/    # authenticated dashboard
components/     # React components (charts, status UI, forms, …)
lib/
  auth/         # session + user store (SQLite)
  monitor/      # check engine + product tables (SQLite)
  security/     # startup hardening (file permissions)
scripts/        # backup.mjs, restore.mjs
data/           # SQLite DB (gitignored, created on first run)
backups/        # encrypted snapshots (gitignored)
```

## API

All dashboard actions go through JSON routes under `app/api/` (monitors, incidents, status-pages, webhooks, settings, account, cron, health). Authentication is session-cookie based.

- `GET /api/health` → `200 {"ok":true,…}` only when DB + secrets are healthy (use it as your uptime probe / load-balancer check)
- `POST /api/cron/check` (Bearer `CRON_SECRET`) → runs due checks; call every minute

## Production deployment

Single-server, self-hosted. Full runbook — secrets, file permissions, systemd service + timer, reverse proxy/TLS, updates, incident response, GDPR operations — in **[DEPLOY.md](DEPLOY.md)**. Read it fully before the first deploy.

## Security notes

- The app locks `data/` to `0700` and DB/env files to `0600` at startup on POSIX systems; run it as a dedicated non-root user on Linux.
- One app instance per SQLite file (WAL mode; no concurrent writers from multiple instances).
- Suspected secret leak? Rotate the secret and restart — sessions signed with the old secret die instantly. See DEPLOY.md §9.

## License

MIT — see [LICENSE](LICENSE).
