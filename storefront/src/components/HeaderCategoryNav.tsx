"use client";

import { usePathname } from "next/navigation";
import { CategoryNav } from "@/components/CategoryNav";
import type { NavCategory } from "@/lib/categories";

// The homepage renders this same CategoryNav itself, below the hero title
// (see app/page.tsx) — everywhere else, it stays in the sticky header since
// no other page has an equivalent title for it to sit under. Needs a client
// component because the sticky Header is a single shared Server Component
// mounted once in the root layout; only usePathname (client-only) can tell
// it which page it's currently rendering into.
export function HeaderCategoryNav({ categories }: { categories: NavCategory[] }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <CategoryNav categories={categories} />;
}
