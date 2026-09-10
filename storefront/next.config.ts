import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Saleor serves uploaded product media from the API's own host —
    // localhost:8000 in local dev. Update/extend this when a real staging
    // or prod API domain exists.
    remotePatterns: [{ protocol: "http", hostname: "localhost", port: "8000" }],
  },
};

export default nextConfig;
