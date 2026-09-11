"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

// Google Analytics 4 + HubSpot tracking, each fully optional — same
// "graceful degradation when not configured" pattern as every other
// integration in this app (Stripe/TaxJar/PayPal/EasyPost all no-op
// without their own env var set). Neither script loads, and no
// tracking call fires, unless the corresponding id is actually set.
//
// Next.js App Router doesn't fire a full page load on client-side
// navigation, so neither GA's gtag.js nor HubSpot's tracking script
// sees those route changes on their own — both are told about them
// explicitly below via a pathname/searchParams watcher.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const HUBSPOT_PORTAL_ID = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    _hsq?: unknown[];
  }
}

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Skip the very first render — both scripts' own load already covers
  // the initial pageview; this effect exists for *subsequent* client-side
  // navigations only, to avoid double-counting the landing page.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const url = searchParams.size > 0 ? `${pathname}?${searchParams}` : pathname;

    if (GA_MEASUREMENT_ID && typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: url,
        send_to: GA_MEASUREMENT_ID,
      });
    }

    if (HUBSPOT_PORTAL_ID && window._hsq) {
      window._hsq.push(["setPath", url]);
      window._hsq.push(["trackPageView"]);
    }
  }, [pathname, searchParams]);

  return null;
}

export function Analytics() {
  if (!GA_MEASUREMENT_ID && !HUBSPOT_PORTAL_ID) return null;

  return (
    <>
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
              window.gtag = gtag;
            `}
          </Script>
        </>
      )}

      {HUBSPOT_PORTAL_ID && (
        <>
          {/* HubSpot's own command-queue convention (like GA's classic
              analytics.js) — queues calls made before the async script
              below has actually finished loading. */}
          <Script id="hubspot-hsq-init" strategy="afterInteractive">
            {`window._hsq = window._hsq || [];`}
          </Script>
          <Script
            id="hubspot-init"
            src={`https://js.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js`}
            strategy="afterInteractive"
          />
        </>
      )}

      {/* Needs Suspense in the parent (see layout.tsx) — useSearchParams()
          opts this subtree out of static rendering otherwise. */}
      <PageviewTracker />
    </>
  );
}
