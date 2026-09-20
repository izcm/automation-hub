import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.env.VERCEL ? __dirname : path.join(__dirname, "../.."),
  },
};

export default nextConfig;
