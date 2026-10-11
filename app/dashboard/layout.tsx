import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

// Server-side guard: every /dashboard route requires a verified session.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getSessionUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}
