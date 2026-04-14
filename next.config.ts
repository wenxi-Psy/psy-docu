import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker / Alibaba Cloud FC container deployment
  output: "standalone",
};

export default nextConfig;
