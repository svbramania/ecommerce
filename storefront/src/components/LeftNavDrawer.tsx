"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, User, ShoppingCart, ChevronRight } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
};

// Amazon's iconic "hamburger" left nav — a slide-in panel from the left
// edge listing the real category tree plus quick account/cart links, as
// an alternative entry point to the top mega-nav (CategoryNav.tsx). Same
// real category data, just a different, more scannable presentation —
// nothing here invents categories beyond what CategoryNav already shows
// honestly (today: one flat "Default Category" plus whatever real tree
// exists under Pet Accessories/Home & Lighting/etc.).
export function LeftNavDrawer({
  categories,
  isSignedIn,
}: {
  categories: Category[];
  isSignedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    // Move focus into the panel when it opens, and give it back to the
    // trigger button on close — standard modal-dialog focus handling.
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open categories menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-1 text-header-fg"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close categories menu"
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            className="absolute inset-0 bg-black/50"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Categories"
            tabIndex={-1}
            className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto bg-nav-flyout-bg outline-none"
          >
            <div className="flex items-center justify-between bg-header-bg px-4 py-3 text-header-fg">
              <span className="flex items-center gap-2 font-medium">
                <User size={18} />
                {isSignedIn ? "Your account" : "Sign in"}
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 py-2">
              <p className="px-4 py-2 text-sm font-bold uppercase tracking-wide text-nav-flyout-fg">
                Shop by category
              </p>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-nav-flyout-fg hover:bg-surface-muted"
              >
                All products
              </Link>
              {categories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/products?category=${category.id}`}
                      onClick={() => setOpen(false)}
                      className="block flex-1 px-4 py-2 text-sm text-nav-flyout-fg hover:bg-surface-muted"
                    >
                      {category.name}
                    </Link>
                    {category.children.length > 0 && (
                      <button
                        type="button"
                        aria-expanded={expandedId === category.id}
                        aria-label={`Show subcategories of ${category.name}`}
                        onClick={() =>
                          setExpandedId(expandedId === category.id ? null : category.id)
                        }
                        className="px-4 py-2 text-nav-flyout-fg"
                      >
                        <ChevronRight
                          size={16}
                          className={expandedId === category.id ? "rotate-90" : ""}
                        />
                      </button>
                    )}
                  </div>
                  {category.children.length > 0 && expandedId === category.id && (
                    <div className="bg-surface-muted">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/products?category=${child.id}`}
                          onClick={() => setOpen(false)}
                          className="block px-8 py-2 text-sm text-nav-flyout-fg hover:bg-surface"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="border-t border-border py-2">
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-nav-flyout-fg hover:bg-surface-muted"
              >
                <ShoppingCart size={18} />
                Cart
              </Link>
              <Link
                href={isSignedIn ? "/account" : "/login"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-nav-flyout-fg hover:bg-surface-muted"
              >
                <User size={18} />
                {isSignedIn ? "Account" : "Sign in"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
