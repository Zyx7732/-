import type { MetadataRoute } from "next"
import prisma from "@/lib/prisma"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}`
  : "http://localhost:3000"

const STATIC_PATHS = ["", "/about", "/blog", "/works/design", "/works/development", "/tutorials"]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, works, tutorials] = await Promise.all([
    prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.work.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.videoTutorial.findMany({ select: { slug: true, updatedAt: true } }),
  ])

  const items: MetadataRoute.Sitemap = []

  for (const locale of ["zh", "en"] as const) {
    for (const path of STATIC_PATHS) {
      items.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
      })
    }

    for (const row of posts) {
      items.push({
        url: `${BASE_URL}/${locale}/blog/${row.slug}`,
        lastModified: row.updatedAt,
      })
    }

    for (const row of works) {
      items.push({
        url: `${BASE_URL}/${locale}/works/${row.slug}`,
        lastModified: row.updatedAt,
      })
    }

    for (const row of tutorials) {
      items.push({
        url: `${BASE_URL}/${locale}/tutorials#${row.slug}`,
        lastModified: row.updatedAt,
      })
    }
  }

  return items
}
