import { cacheExchange, createClient, fetchExchange } from "urql";

// Single shared urql client for talking to Saleor's GraphQL API. The URL is
// the only thing that changes between local/staging/prod (12-factor config,
// see ../../.env.local.example) — nothing here is environment-specific.
const SALEOR_API_URL =
  process.env.NEXT_PUBLIC_SALEOR_API_URL ?? "http://localhost:8000/graphql/";

export const saleorClient = createClient({
  url: SALEOR_API_URL,
  exchanges: [cacheExchange, fetchExchange],
  // urql defaults simple queries to GET, but Saleor's endpoint serves the
  // GraphQL Playground HTML on a bare GET instead of executing the query —
  // confirmed live (Node repro returned the Playground page, not JSON).
  // Forcing POST matches what actually works against this API.
  preferGetMethod: false,
});
