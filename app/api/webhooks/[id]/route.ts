import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { deleteWebhook } from "@/lib/monitor/webhooks";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const ok = deleteWebhook(params.id, user.id);
  if (!ok) return NextResponse.json({ error: "Webhook not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
