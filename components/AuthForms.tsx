"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";

function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:py-20">
      <div className="flex justify-center"><Logo /></div>
      <h1 className="mt-8 text-center text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-center text-sm text-zinc-600">{sub}</p>
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-card">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-[13px] text-red-600" role="alert">{error}</span>}
    </label>
  );
}
const inputCls = "w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15";

async function api(path: string, body: unknown): Promise<{ status: number; data: Record<string, unknown> }> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {}
  return { status: res.status, data };
}

/** One-time recovery-code reveal: copy, confirm saved, continue. Codes are never shown again. */
export function RecoveryCodesBlock({ codes, onDone, doneLabel = "Continue" }: { codes: string[]; onDone: () => void; doneLabel?: string }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div>
      <p className="text-sm leading-relaxed text-zinc-600">
        Save these recovery codes somewhere safe (password manager, printed paper). Each works <strong>once</strong> to
        reset your password — they are never shown again.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {codes.map((c) => (
          <code key={c} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-center font-mono text-sm tracking-wider">{c}</code>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <Button variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy all codes"}</Button>
        <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-zinc-600">
          <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-700" />
          I&apos;ve saved my recovery codes and understand they won&apos;t be shown again.
        </label>
        <Button onClick={onDone} disabled={!saved} className="w-full">{doneLabel}</Button>
      </div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errors, setErrors] = useState<{ email?: string; pw?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => {
      if (r.ok) router.push("/dashboard");
    }).catch(() => {});
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (!pw) errs.pw = "Enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const { status, data } = await api("/api/auth/login", { email, password: pw });
      if (status === 200) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setErrors({ form: typeof data.error === "string" ? data.error : "Sign in failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" sub="Sign in to your StatCheck account.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email}><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputCls} /></Field>
        <Field label="Password" error={errors.pw}><input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className={inputCls} /></Field>
        {errors.form && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700" role="alert">{errors.form}</p>}
        <div className="flex items-center justify-between text-[13px]">
          <span />
          <Link href="/forgot-password" className="font-medium text-zinc-900 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
      <p className="mt-5 text-center text-[13px] text-zinc-600">No account? <Link href="/signup" className="font-medium text-zinc-900 hover:underline">Create one</Link></p>
    </AuthShell>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; pw?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => {
      if (r.ok) router.push("/dashboard");
    }).catch(() => {});
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (name.trim().length < 2) errs.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (pw.length < 8) errs.pw = "Use at least 8 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const { status, data } = await api("/api/auth/register", { name: name.trim(), email, password: pw });
      if (status === 200) {
        if (Array.isArray(data.recoveryCodes) && data.recoveryCodes.length > 0) {
          setRecoveryCodes(data.recoveryCodes as string[]);
          return;
        }
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setErrors({ form: typeof data.error === "string" ? data.error : "Couldn't create your account. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" sub="Free for side projects. No credit card required.">
      {recoveryCodes ? (
        <>
          <h2 className="text-[15px] font-semibold">Save your recovery codes</h2>
          <div className="mt-3">
            <RecoveryCodesBlock
              codes={recoveryCodes}
              doneLabel="Continue to dashboard"
              onDone={() => { router.push("/dashboard"); router.refresh(); }}
            />
          </div>
        </>
      ) : (
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Name" error={errors.name}><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Coleman" autoComplete="name" className={inputCls} /></Field>
        <Field label="Email" error={errors.email}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" className={inputCls} /></Field>
        <Field label="Password" error={errors.pw}><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Minimum 8 characters" autoComplete="new-password" className={inputCls} /></Field>
        {errors.form && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700" role="alert">{errors.form}</p>}
        <Button type="submit" loading={loading} className="w-full">{loading ? "Creating account…" : "Get started"}</Button>
        <p className="text-xs leading-relaxed text-zinc-500">By continuing you agree to the <Link href="/terms" className="underline">Terms</Link> and acknowledge the <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
      </form>
      )}
      <p className="mt-5 text-center text-[13px] text-zinc-600">Have an account? <Link href="/login" className="font-medium text-zinc-900 hover:underline">Sign in</Link></p>
    </AuthShell>
  );
}

export function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter the email address of your account.");
      return;
    }
    if (!code.trim()) {
      setError("Enter one of your recovery codes.");
      return;
    }
    if (pw.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const { status, data } = await api("/api/auth/reset-password", { email, code: code.trim(), newPassword: pw });
      if (status === 200) {
        setDone(true);
        return;
      }
      setError(typeof data.error === "string" ? data.error : "Reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset your password" sub="Use one of the recovery codes from signup. Each code works once.">
      {done ? (
        <div className="text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6L9 17l-5-5" /></svg>
          </span>
          <p className="mt-4 text-sm font-medium">Password updated</p>
          <p className="mt-1 text-[13px] text-zinc-600">All other sessions were signed out. Sign in with your new password.</p>
          <p className="mt-4"><Link href="/login" className="text-sm font-medium underline underline-offset-4">Back to sign in</Link></p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" className={inputCls} /></Field>
          <Field label="Recovery code"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="K7Q2-X9MD" autoComplete="off" spellCheck={false} className={`${inputCls} font-mono tracking-wider`} /></Field>
          <Field label="New password"><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Minimum 8 characters" autoComplete="new-password" className={inputCls} /></Field>
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700" role="alert">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">{loading ? "Resetting…" : "Reset password"}</Button>
          <p className="text-center text-[13px]"><Link href="/login" className="text-zinc-600 hover:text-zinc-900">← Back to sign in</Link></p>
        </form>
      )}
    </AuthShell>
  );
}
