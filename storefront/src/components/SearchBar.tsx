"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

type Suggestion = { name: string; slug: string };

// Plain GET form to /products?q= is the zero-JS baseline (works with the
// existing searchParams.q handling in products/page.tsx, unchanged). The
// debounced fetch below layers real, live type-ahead suggestions on top —
// not fabricated autocomplete phrases.
export function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) return;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-suggest?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <form
      method="GET"
      action="/products"
      className="relative flex-1"
      onSubmit={() => setOpen(false)}
    >
      <div className="flex items-center rounded-md bg-white">
        <input
          type="text"
          name="q"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setOpen(true);
            if (!value.trim()) setSuggestions([]);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search products"
          // Always a white background regardless of theme (matches
          // Amazon's search bar staying light against the dark header even
          // in dark mode) — text-foreground would go light-on-white in
          // dark mode, so this input fixes a dark text color instead of
          // using the theme-flipping token.
          className="w-full rounded-l-md px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-500"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex items-center rounded-r-md bg-accent px-3 py-2 text-accent-fg hover:bg-accent-hover"
        >
          <Search size={18} />
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-nav-flyout-bg shadow-lg">
          {suggestions.map((s) => (
            <li key={s.slug}>
              <a
                href={`/products/${s.slug}`}
                className="block px-3 py-2 text-sm text-nav-flyout-fg hover:bg-surface-muted"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
