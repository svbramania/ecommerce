import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { saleorClient } from "@/lib/saleor-client";
import { ShopInfoDocument } from "@/gql/generated/graphql";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const result = await saleorClient.query(ShopInfoDocument, {}).toPromise();
  const shopName = result.data?.shop?.name ?? "Store";
  return {
    // `template` lets every route's own metadata (e.g. "Cart", a real
    // product name) compose into "<page> | <shop>" instead of every page
    // showing the same bare shop name — a real screen-reader/tab-title
    // navigation gap this fixes app-wide, not just on the homepage.
    title: { default: shopName, template: `%s | ${shopName}` },
    description: result.data?.shop?.description || `Shop at ${shopName}`,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The high-contrast init script below intentionally sets
      // data-contrast on this element before React hydrates, so its
      // value can legitimately differ from the server-rendered markup —
      // the same documented workaround next-themes uses for this exact
      // pattern.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Runs before hydration so a stored high-contrast preference
            doesn't flash the normal palette first (the HighContrastToggle
            component's own effect can't run before hydration). A raw
            <script> tag here breaks hydration (React refuses to render
            script elements client-side) — next/script's
            beforeInteractive strategy is the framework's own mechanism
            for exactly this pre-hydration case. Reads localStorage only —
            no user data, nothing dynamic. */}
        <Script id="high-contrast-init" strategy="beforeInteractive">
          {'try{if(localStorage.getItem("high-contrast")==="true"){document.documentElement.setAttribute("data-contrast","high")}}catch(e){}'}
        </Script>
        {/* Visually hidden until focused — lets a keyboard or voice-control
            user ("click skip to main content") jump past the header/nav
            repeated on every page, instead of tabbing/dictating through it
            each time. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-fg"
        >
          Skip to main content
        </a>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
