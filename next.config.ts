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
  // 为了部署到 GitHub Pages（项目页），启用静态导出并设置
  // basePath 与 assetPrefix 以匹配仓库名，这样生成的静态资源路径
  // 会以 `/-blog/` 为前缀，从而在 https://<user>.github.io/-blog/ 正常加载。
  output: "export",
  trailingSlash: true,
  basePath: "/-blog",
  assetPrefix: "/-blog/",
};

export default nextConfig;
