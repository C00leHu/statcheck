import { productDb } from "./db";
import { newIncidentId } from "./monitors";

export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";

export interface IncidentUpdate {
  id: number;
  status: IncidentStatus;
  message: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  monitorIds: string[];
  createdAt: string;
  updatedAt: string;
  updates: IncidentUpdate[];
}

export interface StatusPage {
  id: string;
  name: string;
  slug: string;
  description: string;
  monitorIds: string[];
  createdAt: string;
}

const VALID_STATUSES: IncidentStatus[] = ["investigating", "identified", "monitoring", "resolved"];

export function isIncidentStatus(s: string): s is IncidentStatus {
  return (VALID_STATUSES as string[]).includes(s);
}

function toIncident(
  r: { id: string; title: string; description: string; status: string; monitor_ids: string; created_at: string; updated_at: string },
  updates: IncidentUpdate[]
): Incident {
  let monitorIds: string[] = [];
  try {
    const parsed: unknown = JSON.parse(r.monitor_ids);
    if (Array.isArray(parsed)) monitorIds = parsed.filter((x): x is string => typeof x === "string");
  } catch {}
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    status: (isIncidentStatus(r.status) ? r.status : "investigating"),
    monitorIds,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    updates,
  };
}

export function getIncidentUpdates(incidentId: string): IncidentUpdate[] {
  const rows = productDb()
    .prepare("SELECT id, status, message, created_at FROM incident_updates WHERE incident_id = ? ORDER BY created_at ASC")
    .all(incidentId) as { id: number; status: string; message: string; created_at: string }[];
  return rows.map((r) => ({ id: r.id, status: isIncidentStatus(r.status) ? r.status : "investigating", message: r.message, createdAt: r.created_at }));
}

export function listIncidents(userId: string): Incident[] {
  const rows = productDb()
    .prepare("SELECT * FROM incidents WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as { id: string; title: string; description: string; status: string; monitor_ids: string; created_at: string; updated_at: string }[];
  return rows.map((r) => toIncident(r, getIncidentUpdates(r.id)));
}

export function getIncident(id: string, userId: string): Incident | null {
  const row = productDb()
    .prepare("SELECT * FROM incidents WHERE id = ? AND user_id = ?")
    .get(id, userId) as { id: string; title: string; description: string; status: string; monitor_ids: string; created_at: string; updated_at: string } | undefined;
  return row ? toIncident(row, getIncidentUpdates(row.id)) : null;
}

export function createIncident(input: {
  userId: string;
  title: string;
  description: string;
  status: IncidentStatus;
  monitorIds: string[];
}): Incident {
  const now = new Date().toISOString();
  const id = newIncidentId("inc");
  const db = productDb();
  db.prepare("INSERT INTO incidents (id, user_id, title, description, status, monitor_ids, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, input.userId, input.title.trim().slice(0, 120), input.description.trim().slice(0, 2000), input.status, JSON.stringify(input.monitorIds), now, now);
  db.prepare("INSERT INTO incident_updates (incident_id, status, message, created_at) VALUES (?, ?, ?, ?)")
    .run(id, input.status, input.description.trim().slice(0, 2000), now);
  const incident = getIncident(id, input.userId) as Incident;
  void import("./webhooks")
    .then(({ fireEvent }) => fireEvent(input.userId, "incident.created", {
      incident: { id, title: incident.title, status: incident.status },
    }))
    .catch(() => {});
  return incident;
}

export function addIncidentUpdate(incidentId: string, userId: string, status: IncidentStatus, message: string): Incident | null {
  const db = productDb();
  const existing = db.prepare("SELECT id FROM incidents WHERE id = ? AND user_id = ?").get(incidentId, userId) as { id: string } | undefined;
  if (!existing) return null;
  const now = new Date().toISOString();
  db.prepare("INSERT INTO incident_updates (incident_id, status, message, created_at) VALUES (?, ?, ?, ?)").run(incidentId, status, message.trim().slice(0, 2000), now);
  db.prepare("UPDATE incidents SET status = ?, updated_at = ? WHERE id = ?").run(status, now, incidentId);
  const incident = getIncident(incidentId, userId);
  if (incident) {
    void import("./webhooks")
      .then(({ fireEvent }) => fireEvent(userId, "incident.updated", {
        incident: { id: incidentId, title: incident.title, status: incident.status },
        message: message.trim().slice(0, 500),
      }))
      .catch(() => {});
  }
  return incident;
}

export function countOpenIncidents(userId: string): number {
  return (productDb().prepare("SELECT COUNT(*) AS c FROM incidents WHERE user_id = ? AND status != 'resolved'").get(userId) as { c: number }).c;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{3,40}$/.test(slug);
}

export function createStatusPage(input: { userId: string; name: string; slug: string; description: string; monitorIds: string[] }): StatusPage | null {
  const now = new Date().toISOString();
  const id = newIncidentId("page");
  try {
    productDb()
      .prepare("INSERT INTO status_pages (id, user_id, name, slug, description, monitor_ids, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, input.userId, input.name.trim().slice(0, 80), input.slug, input.description.trim().slice(0, 500), JSON.stringify(input.monitorIds), now);
  } catch {
    return null; // slug taken
  }
  return getStatusPage(id, input.userId);
}

function toPage(r: { id: string; name: string; slug: string; description: string; monitor_ids: string; created_at: string }): StatusPage {
  let monitorIds: string[] = [];
  try {
    const parsed: unknown = JSON.parse(r.monitor_ids);
    if (Array.isArray(parsed)) monitorIds = parsed.filter((x): x is string => typeof x === "string");
  } catch {}
  return { id: r.id, name: r.name, slug: r.slug, description: r.description, monitorIds, createdAt: r.created_at };
}

export function listStatusPages(userId: string): StatusPage[] {
  const rows = productDb()
    .prepare("SELECT * FROM status_pages WHERE user_id = ? ORDER BY created_at ASC")
    .all(userId) as { id: string; name: string; slug: string; description: string; monitor_ids: string; created_at: string }[];
  return rows.map(toPage);
}

export function getStatusPage(id: string, userId: string): StatusPage | null {
  const row = productDb()
    .prepare("SELECT * FROM status_pages WHERE id = ? AND user_id = ?")
    .get(id, userId) as { id: string; name: string; slug: string; description: string; monitor_ids: string; created_at: string } | undefined;
  return row ? toPage(row) : null;
}

/** Public lookup by slug (no auth) for the public status page route. */
export function getStatusPageBySlug(slug: string): (StatusPage & { userId: string }) | null {
  const row = productDb()
    .prepare("SELECT id, name, slug, description, monitor_ids, created_at, user_id FROM status_pages WHERE slug = ?")
    .get(slug) as { id: string; name: string; slug: string; description: string; monitor_ids: string; created_at: string; user_id: string } | undefined;
  if (!row) return null;
  const { user_id, ...rest } = row;
  return { ...toPage(rest), userId: user_id };
}

export function deleteStatusPage(id: string, userId: string): boolean {
  return productDb().prepare("DELETE FROM status_pages WHERE id = ? AND user_id = ?").run(id, userId).changes > 0;
}

export function getAlertEmailEnabled(userId: string): boolean {
  const row = productDb().prepare("SELECT alert_email FROM user_settings WHERE user_id = ?").get(userId) as { alert_email: number } | undefined;
  return row ? row.alert_email === 1 : true;
}

export function setAlertEmailEnabled(userId: string, enabled: boolean): void {
  productDb()
    .prepare("INSERT INTO user_settings (user_id, alert_email) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET alert_email = ?")
    .run(userId, enabled ? 1 : 0, enabled ? 1 : 0);
}

/** True once the user completed onboarding (or skipped it) — setup never shows again after that. */
export function getOnboardingDone(userId: string): boolean {
  try {
    const row = productDb().prepare("SELECT onboarding_done FROM user_settings WHERE user_id = ?").get(userId) as { onboarding_done: number } | undefined;
    return row ? row.onboarding_done === 1 : false;
  } catch {
    return false;
  }
}

export function setOnboardingDone(userId: string): void {
  productDb()
    .prepare("INSERT INTO user_settings (user_id, onboarding_done) VALUES (?, 1) ON CONFLICT(user_id) DO UPDATE SET onboarding_done = 1")
    .run(userId);
}
