"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
};

// Real category tree, recursed as-is — today's real data is one flat
// category with no children, which renders correctly here as a single item
// with no flyout arrow. Nothing here invents sibling categories to make the
// nav look fuller than the real catalog.
//
// The flyout opens on hover (desktop mouse) AND on focus (keyboard Tab)
// AND via an explicit toggle button (touch — hover never fires on a touch
// device, confirmed live that without this, a category's children were
// completely unreachable on a real mobile viewport since tapping the
// category name just navigated away immediately).
export function CategoryNav({ categories }: { categories: Category[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <nav className="border-t border-white/10 bg-header-bg">
      <ul className="mx-auto flex max-w-6xl gap-1 px-4 text-sm">
        <li>
          <Link
            href="/products"
            className="block px-3 py-2 text-header-fg hover:bg-white/10"
          >
            All products
          </Link>
        </li>
        {categories.map((category) => {
          const hasChildren = category.children.length > 0;
          const isOpen = openId === category.id;
          return (
            <li
              key={category.id}
              className="relative"
              onMouseEnter={() => hasChildren && setOpenId(category.id)}
              onMouseLeave={() => hasChildren && setOpenId(null)}
              onBlur={(e) => {
                // Only close once focus has actually left this whole item
                // (not just moved from the link to the toggle button inside it).
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOpenId(null);
                }
              }}
            >
              <div className="flex items-center">
                <Link
                  href={`/products?category=${category.id}`}
                  onFocus={() => hasChildren && setOpenId(category.id)}
                  className="px-3 py-2 text-header-fg hover:bg-white/10"
                >
                  {category.name}
                </Link>
                {hasChildren && (
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-label={`Show categories under ${category.name}`}
                    onClick={() => setOpenId(isOpen ? null : category.id)}
                    className="px-2 py-2 text-header-fg hover:bg-white/10"
                  >
                    <ChevronDown size={14} />
                  </button>
                )}
              </div>
              {hasChildren && isOpen && (
                <ul className="absolute left-0 top-full z-20 min-w-[12rem] rounded-b-md border border-border bg-nav-flyout-bg py-2 shadow-lg">
                  {category.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/products?category=${child.id}`}
                        className="block px-4 py-1.5 text-nav-flyout-fg hover:bg-surface-muted"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
