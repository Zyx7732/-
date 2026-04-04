import type { Locale } from "@/lib/i18n"
import { toI18nObject, toI18nText } from "@/lib/i18n-content"
import { resolveI18nObject, resolveI18nText } from "@/lib/i18n"

function localeText(obj: unknown, locale: Locale, fallback: Locale): string | null {
  if (!obj || typeof obj !== "object") return null
  const value = resolveI18nText(obj as { zh?: string | null; en?: string | null }, locale, fallback)
  return value || null
}

function localeObj<T>(obj: unknown, locale: Locale, fallback: Locale): T | null {
  if (!obj || typeof obj !== "object") return null
  return resolveI18nObject(obj as { zh?: T | null; en?: T | null }, locale, fallback)
}

export function localizePost<T extends Record<string, unknown>>(row: T, locale: Locale, fallback: Locale): T {
  return {
    ...row,
    title: localeText(row.titleI18n, locale, fallback) ?? (row.title as string),
    slug: localeText(row.slugI18n, locale, fallback) ?? (row.slug as string),
    excerpt: localeText(row.excerptI18n, locale, fallback) ?? (row.excerpt as string | null),
    content: localeObj(row.contentI18n, locale, fallback) ?? row.content,
  }
}

export function localizeWork<T extends Record<string, unknown>>(row: T, locale: Locale, fallback: Locale): T {
  return {
    ...row,
    title: localeText(row.titleI18n, locale, fallback) ?? (row.title as string),
    slug: localeText(row.slugI18n, locale, fallback) ?? (row.slug as string),
    description: localeText(row.descriptionI18n, locale, fallback) ?? (row.description as string | null),
    content: localeObj(row.contentI18n, locale, fallback) ?? row.content,
  }
}

export function localizeTutorial<T extends Record<string, unknown>>(row: T, locale: Locale, fallback: Locale): T {
  return {
    ...row,
    title: localeText(row.titleI18n, locale, fallback) ?? (row.title as string),
    slug: localeText(row.slugI18n, locale, fallback) ?? (row.slug as string),
    description: localeText(row.descriptionI18n, locale, fallback) ?? (row.description as string | null),
  }
}

export function localizeCategory<T extends Record<string, unknown>>(row: T, locale: Locale, fallback: Locale): T {
  return {
    ...row,
    name: localeText(row.nameI18n, locale, fallback) ?? (row.name as string),
    slug: localeText(row.slugI18n, locale, fallback) ?? (row.slug as string),
  }
}

export function localizeTag<T extends Record<string, unknown>>(row: T, locale: Locale, fallback: Locale): T {
  return {
    ...row,
    name: localeText(row.nameI18n, locale, fallback) ?? (row.name as string),
  }
}

export function buildPostI18nInput(raw: {
  title?: string
  slug?: string
  excerpt?: string | null
  content?: unknown
  titleI18n?: unknown
  slugI18n?: unknown
  excerptI18n?: unknown
  contentI18n?: unknown
}) {
  return {
    titleI18n: raw.titleI18n ?? toI18nText(raw.title ?? "", null),
    slugI18n: raw.slugI18n ?? toI18nText(raw.slug ?? "", null),
    excerptI18n: raw.excerptI18n ?? toI18nText(raw.excerpt ?? null, null),
    contentI18n: raw.contentI18n ?? toI18nObject(raw.content ?? {}, null),
  }
}

export function buildWorkI18nInput(raw: {
  title?: string
  slug?: string
  description?: string | null
  content?: unknown
  titleI18n?: unknown
  slugI18n?: unknown
  descriptionI18n?: unknown
  contentI18n?: unknown
}) {
  return {
    titleI18n: raw.titleI18n ?? toI18nText(raw.title ?? "", null),
    slugI18n: raw.slugI18n ?? toI18nText(raw.slug ?? "", null),
    descriptionI18n: raw.descriptionI18n ?? toI18nText(raw.description ?? null, null),
    contentI18n: raw.contentI18n ?? toI18nObject(raw.content ?? null, null),
  }
}

export function buildTutorialI18nInput(raw: {
  title?: string
  slug?: string
  description?: string | null
  titleI18n?: unknown
  slugI18n?: unknown
  descriptionI18n?: unknown
}) {
  return {
    titleI18n: raw.titleI18n ?? toI18nText(raw.title ?? "", null),
    slugI18n: raw.slugI18n ?? toI18nText(raw.slug ?? "", null),
    descriptionI18n: raw.descriptionI18n ?? toI18nText(raw.description ?? null, null),
  }
}
