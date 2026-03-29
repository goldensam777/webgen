import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "(?<slug>[a-z0-9-]+)\\.webgen\\.app",
            },
          ],
          destination: "/s/:slug/:path*",
        },
      ],
    };
  },
};

export default nextConfig;