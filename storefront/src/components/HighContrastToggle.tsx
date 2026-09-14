"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "high-contrast";

// Reads/writes data-contrast="high" on <html>, matching the
// :root[data-contrast="high"] overrides in globals.css. Persisted in
// localStorage (not a cookie/account setting — no server-side rendering
// dependency exists on this, so a client-only toggle is honest here).
// The lazy initializer reads real client state instead of copying it in
// via a mount effect (an anti-pattern React's own lint flags) — it
// intentionally differs from the server-rendered "false", so the
// checkbox below carries suppressHydrationWarning for that one, expected
// mismatch.
function readStored(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function HighContrastToggle() {
  const [enabled, setEnabled] = useState(readStored);

  useEffect(() => {
    document.documentElement.setAttribute("data-contrast", enabled ? "high" : "normal");
    try {
      window.localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // Ignore — the toggle still works for the rest of this page view.
    }
  }, [enabled]);

  return (
    <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-muted px-4 py-3">
      <span className="flex flex-col">
        <span className="text-sm font-medium text-foreground">High-contrast mode</span>
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          Increases link and border contrast to meet WCAG AAA (7:1). Saved on this device.
        </span>
      </span>
      <input
        type="checkbox"
        role="switch"
        aria-checked={enabled}
        checked={enabled}
        suppressHydrationWarning
        onChange={(e) => setEnabled(e.target.checked)}
        className="h-5 w-9 shrink-0 cursor-pointer accent-accent"
      />
    </label>
  );
}
