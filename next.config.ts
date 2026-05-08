import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 避免 Turbopack/Webpack 打包 Prisma，使用 node_modules 中的 .prisma/client
  serverExternalPackages: ["@prisma/client", "prisma", "wechatpay-node-v3"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
    ],
  },
  // 在 Vercel 上部署应使用默认运行时（服务器/Edge），
  // 因此不设置 `output: "export"`。如果你仍需静态导出，
  // 请使用 `npm run export` 或保留这项设置。
};

export default nextConfig;
