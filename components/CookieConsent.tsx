"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const KEY = "sc-cookie-consent-v1";
export const COOKIE_SETTINGS_EVENT = "sc:open-cookie-settings";

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT));
}

function readConsent(): { preferences: boolean; analytics: boolean } | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [decided, setDecided] = useState(true);
  const [customizing, setCustomizing] = useState(false);
  const [preferences, setPreferences] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = readConsent();
    if (existing) {
      setPreferences(existing.preferences);
      setAnalytics(existing.analytics);
      setDecided(true);
    } else {
      setDecided(false);
    }
    const open = () => {
      const c = readConsent();
      if (c) {
        setPreferences(c.preferences);
        setAnalytics(c.analytics);
      }
      setDecided(false);
      setCustomizing(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, open);
  }, []);

  const save = useCallback((prefs: { preferences: boolean; analytics: boolean }) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...prefs, necessary: true, ts: new Date().toISOString() }));
    } catch {}
    setPreferences(prefs.preferences);
    setAnalytics(prefs.analytics);
    setDecided(true);
    setCustomizing(false);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Floating cookie badge — always available */}
      {decided && (
        <button
          onClick={() => {
            setDecided(false);
            setCustomizing(true);
          }}
          aria-label="Open cookie settings"
          title="Cookie settings"
          className="fixed bottom-4 left-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-pop transition-all hover:scale-105 hover:text-zinc-900 hover:shadow-card"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z" />
            <path d="M8.5 11h.01M12 7.5h.01M15.5 12h.01M11 15h.01" strokeWidth="2.4" />
          </svg>
        </button>
      )}

      {/* Consent banner */}
      {!decided && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
          className="banner-enter fixed bottom-4 left-4 right-4 z-[60] sm:left-auto sm:w-[400px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-pop"
        >
          <div className="h-[3px] w-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600" aria-hidden="true" />
          <div className="p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z" />
                  <path d="M8.5 11h.01M12 7.5h.01M15.5 12h.01" strokeWidth="2.4" />
                </svg>
              </span>
              <p className="text-sm font-semibold">Cookies, kept minimal</p>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-600">
              Strictly-necessary cookies keep you signed in. Optional cookies are off unless you allow them. See the{" "}
              <Link href="/cookies" className="font-medium text-zinc-900 underline underline-offset-2">Cookie Policy</Link>.
            </p>
            {customizing && (
              <div className="mt-3 space-y-2 rounded-xl bg-zinc-50 p-3">
                <ToggleRow label="Strictly necessary" desc="Sign-in, security" locked on />
                <ToggleRow label="Preferences" desc="Theme, dashboard layout" on={preferences} onChange={setPreferences} />
                <ToggleRow label="Analytics" desc="Anonymous usage stats" on={analytics} onChange={setAnalytics} />
              </div>
            )}
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => save({ preferences: true, analytics: true })}
                  className="flex-1 rounded-lg bg-zinc-900 px-3 py-2 text-[13px] font-medium text-white transition-all hover:bg-zinc-700 active:scale-[0.98]"
                >
                  Accept all
                </button>
                <button
                  onClick={() => save({ preferences: false, analytics: false })}
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  Reject optional
                </button>
              </div>
              {customizing ? (
                <button onClick={() => save({ preferences, analytics })} className="rounded-lg px-3 py-2 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-50">
                  Save my selection
                </button>
              ) : (
                <button onClick={() => setCustomizing(true)} className="rounded-lg px-3 py-1.5 text-[13px] text-zinc-500 transition-colors hover:text-zinc-900">
                  Customize
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ToggleRow({ label, desc, on, onChange, locked = false }: { label: string; desc: string; on?: boolean; onChange?: (v: boolean) => void; locked?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium leading-tight">{label}</p>
        <p className="text-xs text-zinc-500">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={locked ? true : on}
        aria-label={label}
        disabled={locked}
        onClick={() => onChange?.(!on)}
        className={cn(
          "ml-auto flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
          (locked || on) ? "bg-emerald-600" : "bg-zinc-300",
          locked && "cursor-not-allowed opacity-80"
        )}
      >
        <span className={cn("h-5 w-5 rounded-full bg-white shadow transition-transform", (locked || on) ? "translate-x-5" : "translate-x-0")} />
      </button>
    </div>
  );
}

/** Button for the Cookie Policy page that reopens the consent banner. */
export function CookieSettingsButton() {
  return (
    <button
      onClick={openCookieSettings}
      className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-700 active:scale-[0.98]"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z" />
      </svg>
      Open cookie settings
    </button>
  );
}
