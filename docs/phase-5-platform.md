# Phase 5 — Platform/ecosystem layer

Status as of 2026-09-09: **not started, and deliberately not decided
for you.**

This phase only makes sense if the answer to an open strategic question
(raised earlier in planning, never confirmed) is "yes": is this project a
**single store** that happens to have a clean supplier/3PL integration
contract (Phases 1-2 as built), or is it meant to become a **multi-merchant
platform** — other businesses running their own stores on this
infrastructure, the way Shopify itself works?

Everything built so far (Phases 0-2, and the started Phase 4) works
either way — a clean fulfillment-webhook contract is valuable for a single
store too. But Phase 5 specifically (OAuth app-install model with scoped
permissions, a public developer API, a partner directory/marketplace, a
sandbox for third-party developers) is a large, separate architectural
commitment that only pays off under the "become a platform" answer.
Building it speculatively, without that decision, risks a lot of unused
infrastructure — the same risk flagged earlier in this project's planning
conversation.

**Not started. Answer the single-store-vs-platform question first**, then
this phase gets scoped for real.
