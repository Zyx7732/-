/** 通用工具：cn 合并 class、getBaseUrl 取站点根地址。 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function isLocalUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url)
}

/** 服务端请求 API 时使用的站点根地址（Vercel 上跳过 localhost 配置） */
export function getBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (typeof siteUrl === "string" && siteUrl && !isLocalUrl(siteUrl)) {
    return siteUrl.replace(/\/$/, "")
  }
  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL
  if (typeof authUrl === "string" && authUrl && !isLocalUrl(authUrl)) {
    return authUrl.replace(/\/$/, "")
  }
  if (typeof process.env.VERCEL_PROJECT_PRODUCTION_URL === "string" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (typeof authUrl === "string" && authUrl) {
    return authUrl.replace(/\/$/, "")
  }
  return "http://localhost:3000"
}
