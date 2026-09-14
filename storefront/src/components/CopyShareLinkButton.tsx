"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CopyShareLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded-md border border-border bg-surface-muted px-3 py-2 text-xs text-foreground">
        {fullUrl}
      </code>
      <Button
        variant="secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard API can be unavailable (permissions, non-secure
            // context) — the link is still visible above to copy by hand.
          }
        }}
      >
        {copied ? "Copied!" : "Copy link"}
      </Button>
      {/* The button's own visible text already changes to "Copied!", but a
          screen reader isn't guaranteed to re-announce a focused button's
          label change — this explicit status region makes sure it's heard
          either way. */}
      <span role="status" className="sr-only">
        {copied ? "Link copied to clipboard." : ""}
      </span>
    </div>
  );
}
