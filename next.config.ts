import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "(?<slug>[a-z0-9-]+)\\.webgenx\\.app",
            },
          ],
          destination: "/s/:slug/:path*",
        },
      ],
    };
  },
};

export default nextConfig;