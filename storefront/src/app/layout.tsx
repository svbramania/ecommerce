import type { Metadata } from "next";
import { Suspense } from "react";
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
    title: shopName,
    description: result.data?.shop?.description || `Shop at ${shopName}`,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
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
