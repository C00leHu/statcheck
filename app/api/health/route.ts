import { NextResponse } from "next/server";
import { productDb } from "@/lib/monitor/db";

/** Liveness + config check for hosts/load balancers. Exposes booleans only, never secret values. */
export async function GET() {
  let database = false;
  try {
    productDb().prepare("SELECT 1").get();
    database = true;
  } catch {
    database = false;
  }
  const checks = {
    database,
    sessionSecretConfigured: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32),
    cronSecretConfigured: Boolean(process.env.CRON_SECRET),
  };
  const ok = checks.database && checks.sessionSecretConfigured;
  return NextResponse.json({ ok, time: new Date().toISOString(), checks }, { status: ok ? 200 : 503 });
}
