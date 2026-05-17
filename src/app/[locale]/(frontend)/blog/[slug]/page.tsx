import { renderBlogPostPage } from "@/app/(frontend)/blog/[slug]/page"
import { isLocale } from "@/lib/i18n"
import { notFound } from "next/navigation"

export default async function LocalizedBlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  return renderBlogPostPage({ slug, locale })
}
