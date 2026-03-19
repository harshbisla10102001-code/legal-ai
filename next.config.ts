import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    GROQ_API_KEY: process.env.GROQ_API_KEY ?? "",
  },
  serverExternalPackages: ["@react-pdf/renderer", "tesseract.js"],
};

export default nextConfig;
