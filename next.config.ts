import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // dev only — lets other devices on the LAN (e.g. phone) load HMR / dev assets
  allowedDevOrigins: ["192.168.10.142", "192.168.*.*"],
  turbopack: {
    root: process.env.VERCEL ? __dirname : path.join(__dirname, "../.."),
  },
};

export default nextConfig;
