"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Suggestion = { name: string; slug: string };

// Plain GET form to /products?q= is the zero-JS baseline (works with the
// existing searchParams.q handling in products/page.tsx, unchanged). The
// debounced fetch below layers real, live type-ahead suggestions on top —
// not fabricated autocomplete phrases. ARIA combobox pattern (role=
// combobox/listbox/option, aria-activedescendant) plus arrow-key/Enter/
// Escape handling — the initial version only worked with a mouse click,
// which is a real accessibility gap for keyboard and screen-reader users.
export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) return;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-suggest?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const showList = open && suggestions.length > 0;

  return (
    <form
      method="GET"
      action="/products"
      // min-w-0 overrides the flex-item default min-width:auto, which was
      // sizing this to its content's intrinsic width and refusing to
      // shrink — confirmed live on a real mobile viewport that without
      // this, the search bar (and everything after it) overflowed the
      // header and pushed the cart link off-screen entirely.
      className="relative min-w-0 flex-1"
      onSubmit={() => setOpen(false)}
    >
      <div className="flex min-w-0 items-center rounded-md bg-white">
        <input
          type="text"
          name="q"
          role="combobox"
          aria-expanded={showList}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined
          }
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setOpen(true);
            if (!value.trim()) setSuggestions([]);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!showList) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1) % suggestions.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
            } else if (e.key === "Enter" && activeIndex >= 0) {
              e.preventDefault();
              setOpen(false);
              router.push(`/products/${suggestions[activeIndex].slug}`);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Search products"
          // Always a white background regardless of theme (matches
          // Amazon's search bar staying light against the dark header even
          // in dark mode) — text-foreground would go light-on-white in
          // dark mode, so this input fixes a dark text color instead of
          // using the theme-flipping token.
          className="w-full min-w-0 rounded-l-md px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-500"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex items-center rounded-r-md bg-accent px-3 py-2 text-accent-fg hover:bg-accent-hover"
        >
          <Search size={18} />
        </button>
      </div>

      {showList && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-10 mt-1 w-full rounded-md border border-border bg-nav-flyout-bg shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li key={s.slug} id={`search-suggestion-${i}`} role="option" aria-selected={i === activeIndex}>
              <a
                href={`/products/${s.slug}`}
                className={`block px-3 py-2 text-sm text-nav-flyout-fg hover:bg-surface-muted ${
                  i === activeIndex ? "bg-surface-muted" : ""
                }`}
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
