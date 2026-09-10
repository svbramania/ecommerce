import type { CodegenConfig } from "@graphql-codegen/cli";

// Pulls Saleor's live GraphQL schema (introspection) and generates typed
// hooks/documents from src/gql/**/*.graphql — run `npm run codegen` whenever
// the API is up locally (docker compose up -d) and a query changes.
const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_SALEOR_API_URL ?? "http://localhost:8000/graphql/",
  documents: ["src/**/*.graphql"],
  generates: {
    "src/gql/generated/": {
      preset: "client",
      // Fragment masking is useful for large teams enforcing per-component
      // data colocation; at this project's current size it just adds an
      // unwrap step everywhere, so it's off — direct field access instead.
      presetConfig: { fragmentMasking: false },
    },
  },
};

export default config;
