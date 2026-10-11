import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getAlertEmailEnabled, setAlertEmailEnabled, setOnboardingDone } from "@/lib/monitor/content";
import { updateUserName } from "@/lib/auth/store";

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ settings: { name: user.name, email: user.email, alertEmail: getAlertEmailEnabled(user.id) } });
}

export async function PATCH(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { name?: string; alertEmail?: boolean; onboardingDone?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Name must be 2–80 characters." }, { status: 400 });
    updateUserName(user.id, name);
  }
  if (typeof body.alertEmail === "boolean") {
    setAlertEmailEnabled(user.id, body.alertEmail);
  }
  if (body.onboardingDone === true) {
    setOnboardingDone(user.id);
  }
  const updated = getSessionUser();
  return NextResponse.json({
    settings: { name: updated?.name ?? user.name, email: user.email, alertEmail: getAlertEmailEnabled(user.id) },
  });
}
