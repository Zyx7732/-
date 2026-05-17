/** 博客文章详情页：标题、封面、正文（BlockNote/Tiptap 转 HTML）、SEO。 */
export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CardDescriptionHtml } from "@/components/frontend/CardDescriptionHtml"
import { contentToHtml, jsonToPlainText } from "@/lib/render-content"
import { defaultNav } from "@/lib/nav-config"
import { defaultPersonalName, defaultSiteName } from "@/lib/page-copy"
import { ProseImageLightbox } from "@/components/frontend/ProseImageLightbox"
import { getDictionary } from "@/locales"
import { DEFAULT_LOCALE, fromPrismaLocale, normalizeLocale, type I18nObject, type Locale, t } from "@/lib/i18n"
import { findPostBySlug } from "@/lib/find-post-by-slug"
import { getLocaleFromCookie } from "@/lib/i18n-server"
import { withLocalePath } from "@/lib/i18n-path"
import { auth } from "@/lib/auth"
import { getFrontendSettings } from "@/lib/settings-server"
import { getSettingsRow } from "@/lib/settings-db"
import { localizePost } from "@/lib/localized-content"
import { resolveWithFallbackObject } from "@/lib/i18n-content"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

type BlogPostViewProps = {
  slug: string
  locale?: Locale
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  return renderBlogPostPage({ slug })
}

export async function renderBlogPostPage({ slug, locale }: BlogPostViewProps) {
  const session = await auth()
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN"
  const resolvedLocale = normalizeLocale(locale ?? (await getLocaleFromCookie()) ?? DEFAULT_LOCALE)

  const [postRow, settingsRow] = await Promise.all([
    findPostBySlug(slug, { includeUnpublished: isAdmin }),
    getSettingsRow(),
  ])
  if (!postRow) notFound()

  const fallbackLocale = fromPrismaLocale(settingsRow?.defaultLocale)
  const post = localizePost(postRow as unknown as Record<string, unknown>, resolvedLocale, fallbackLocale)
  const settings = await getFrontendSettings(resolvedLocale)
  const sectionLabel = settings.nav.blog ?? defaultNav.blog
  const dict = getDictionary(resolvedLocale)
  const homeHref = withLocalePath("/", resolvedLocale)
  const blogHref = withLocalePath("/blog", resolvedLocale)
  const siteName = settings.siteName || defaultSiteName

  const aboutRaw = settingsRow?.about
  const aboutI18nObject: I18nObject<Record<string, unknown>> =
    aboutRaw && typeof aboutRaw === "object" && ("zh" in aboutRaw || "en" in aboutRaw)
      ? (aboutRaw as I18nObject<Record<string, unknown>>)
      : {
          zh: aboutRaw && typeof aboutRaw === "object" ? (aboutRaw as Record<string, unknown>) : null,
          en: null,
        }
  const about =
    resolveWithFallbackObject<Record<string, unknown>>(aboutI18nObject, resolvedLocale, fallbackLocale) ?? {}
  const profileCard =
    about.profileCard && typeof about.profileCard === "object"
      ? (about.profileCard as Record<string, unknown>)
      : {}

  const contentHtml = contentToHtml(post.content)
  const bodyPlain = jsonToPlainText(post.content)
  const categoryName = (post.category as { name?: string } | null | undefined)?.name ?? ""
  const tags = Array.isArray(post.tags) ? (post.tags as { id: string; name: string }[]) : []
  const author = post.author as { avatar?: string | null; name?: string | null } | null | undefined
  const dateLocale = resolvedLocale === "en" ? "en-US" : "zh-CN"
  const publishedAt = post.publishedAt
    ? new Date(post.publishedAt as string | Date).toLocaleDateString(dateLocale, { year: "numeric", month: "2-digit", day: "2-digit" })
    : post.createdAt
      ? new Date(post.createdAt as string | Date).toLocaleDateString(dateLocale, { year: "numeric", month: "2-digit", day: "2-digit" })
      : ""

  const authorAvatar = settingsRow?.avatar || author?.avatar || ""
  const authorName =
    (typeof profileCard.personalName === "string" && profileCard.personalName) ||
    author?.name ||
    defaultPersonalName
  const authorTitle =
    typeof profileCard.personalTitle === "string" ? profileCard.personalTitle : ""

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-16 py-12 pb-28 lg:pb-16">
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mb-10">
        <Link href={homeHref} className="hover:text-foreground transition-colors flex items-center gap-1 min-w-0 max-w-[30vw] sm:max-w-none truncate">
          <i className="ri-home-4-line shrink-0" /> <span className="truncate">{siteName}</span>
        </Link>
        <i className="ri-arrow-right-s-line text-muted-foreground/60 shrink-0" />
        <Link href={blogHref} className="hover:text-foreground transition-colors shrink-0">{sectionLabel}</Link>
        <i className="ri-arrow-right-s-line text-muted-foreground/60 shrink-0" />
        <span className="text-foreground truncate min-w-0 max-w-[50vw] sm:max-w-[200px]">{String(post.title ?? "")}</span>
      </nav>

      <article>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {categoryName && <span className="tag">{categoryName}</span>}
          {tags.map((tag) => (
            <span key={tag.id} className="tag">{tag.name}</span>
          ))}
          {publishedAt && (
            <time className="text-sm text-muted-foreground flex items-center gap-1">
              <i className="ri-calendar-line" /> {publishedAt}
            </time>
          )}
        </div>

        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight tracking-tight">
          {String(post.title ?? "")}
        </h1>

        {typeof post.excerpt === "string" && post.excerpt && (
          <CardDescriptionHtml
            html={post.excerpt}
            lines={false}
            className="text-lg text-muted-foreground mb-8 leading-relaxed"
          />
        )}

        <div className="flex items-center gap-3 mb-10 pb-10 border-b border-border">
          {authorAvatar ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-border relative">
              <Image
                src={authorAvatar}
                unoptimized
                alt={authorName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-muted-foreground text-sm">
              {authorName.slice(0, 1)}
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{authorName}</p>
            {authorTitle && (
              <p className="text-sm text-muted-foreground">{authorTitle}</p>
            )}
          </div>
        </div>

        {(contentHtml || bodyPlain) && (
          <div className="min-w-0 overflow-x-hidden">
            <ProseImageLightbox>
              <div
                className="prose prose-neutral dark:prose-invert prose-lg max-w-none
                  prose-headings:font-serif prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-foreground/70 prose-p:leading-relaxed
                  prose-li:text-foreground/70
                  prose-strong:text-foreground
                  prose-theme prose-a:no-underline hover:prose-a:underline
                  prose-code:bg-accent prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-accent prose-pre:border prose-pre:border-border
                  prose-blockquote:text-muted-foreground
                  prose-img:rounded-lg prose-img:my-4
                  prose-mark:bg-yellow-200/80 prose-mark:dark:bg-yellow-900/40
                  [&_.tiptap-img]:rounded-lg
                  [&_figure]:my-6 [&_figure]:overflow-hidden [&_figure]:!max-w-full [&_figure_img]:my-0 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground [&_figcaption]:mt-2
                  [&_.checklist]:list-none [&_.checklist]:pl-0 [&_.checklist_li]:flex [&_.checklist_li]:items-start [&_.checklist_li]:gap-2
                  [&_img]:!max-w-full [&_img]:h-auto [&_img]:object-contain [&_img]:rounded-lg
                  [&_video]:!max-w-full [&_video]:h-auto [&_video]:rounded-lg
                "
              >
              {contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              ) : (
                bodyPlain.split("\n").map((line, i) => (
                  <p key={i}>{line || "\u00A0"}</p>
                ))
              )}
              </div>
            </ProseImageLightbox>
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
          <Link
            href={blogHref}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 pride-underline"
          >
            <i className="ri-arrow-left-line" /> {t(dict, "frontend.back_to_blog", "返回文章列表")}
          </Link>
        </div>
      </article>
    </div>
  )
}
