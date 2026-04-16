import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker / Alibaba Cloud FC container deployment
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Alibaba Cloud FC HTTP trigger sets Content-Disposition: attachment
          // by default. Override it so browsers render the page instead of downloading.
          { key: "Content-Disposition", value: "inline" },
        ],
      },
    ];
  },
};

export default nextConfig;
