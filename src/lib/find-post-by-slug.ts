import prisma from "@/lib/prisma"
import type { Post, Prisma } from "@prisma/client"

type PostWithRelations = Post & {
  category: { name: string } | null
  tags: { id: string; name: string }[]
  author: { avatar: string | null; name: string | null } | null
}

const postInclude = {
  category: true,
  tags: true,
  author: true,
} satisfies Prisma.PostInclude

function normalizeSlug(slug: string): string {
  return decodeURIComponent(slug).trim()
}

function matchesSlugI18n(slugI18n: unknown, slug: string): boolean {
  if (!slugI18n || typeof slugI18n !== "object") return false
  const i18n = slugI18n as { zh?: string | null; en?: string | null }
  return i18n.zh === slug || i18n.en === slug
}

/** 按 slug / slugI18n 解析文章 id；默认仅已发布，管理员可包含草稿。 */
export async function findPostIdBySlug(
  slug: string,
  options: { includeUnpublished?: boolean } = {},
): Promise<string | null> {
  const post = await findPostBySlug(slug, options)
  return post?.id ?? null
}

/** 按 slug / slugI18n 查询文章（Prisma 直查，避免服务端 HTTP 自调用失败）。 */
export async function findPostBySlug(
  slug: string,
  options: { includeUnpublished?: boolean } = {},
): Promise<PostWithRelations | null> {
  const normalizedSlug = normalizeSlug(slug)
  const statusWhere = options.includeUnpublished ? {} : { status: "PUBLISHED" as const }

  const direct = await prisma.post.findFirst({
    where: { slug: normalizedSlug, ...statusWhere },
    include: postInclude,
  })
  if (direct) return direct as PostWithRelations

  const candidates = await prisma.post.findMany({
    where: statusWhere,
    select: { id: true, slugI18n: true },
  })
  const match = candidates.find((row) => matchesSlugI18n(row.slugI18n, normalizedSlug))
  if (!match) return null

  const post = await prisma.post.findUnique({
    where: { id: match.id },
    include: postInclude,
  })
  return post as PostWithRelations | null
}
