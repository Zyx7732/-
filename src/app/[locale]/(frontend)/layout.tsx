import { notFound } from "next/navigation"
import { getFrontendSettings } from "@/lib/settings-server"
import { isLocale, type Locale } from "@/lib/i18n"
import FrontendLayoutClient from "@/app/(frontend)/FrontendLayoutClient"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const initial = await getFrontendSettings(locale)
  const siteName = initial.siteName || "Fan's Studio"
  const description = initial.pageCopy.siteDescription || ""
  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    alternates: {
      languages: {
        zh: `/zh`,
        en: `/en`,
      },
    },
  }
}

export const dynamic = "force-dynamic"

export default async function LocalizedFrontendLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const initial = await getFrontendSettings(locale as Locale)
  return <FrontendLayoutClient initial={initial}>{children}</FrontendLayoutClient>
}
