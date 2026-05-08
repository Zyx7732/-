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
  // 为静态导出（next export）启用输出模式
  output: "export",
  // 使用 trailingSlash 可让导出的页面路径更兼容 GitHub Pages
  trailingSlash: true,
};

export default nextConfig;
