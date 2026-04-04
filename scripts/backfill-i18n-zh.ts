import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("[i18n-backfill] start")

  const posts = await prisma.post.findMany({
    select: { id: true, title: true, slug: true, excerpt: true, content: true, titleI18n: true },
  })
  for (const row of posts) {
    if (row.titleI18n) continue
    await prisma.post.update({
      where: { id: row.id },
      data: {
        titleI18n: { zh: row.title, en: null },
        slugI18n: { zh: row.slug, en: null },
        excerptI18n: { zh: row.excerpt, en: null },
        contentI18n: { zh: row.content, en: null },
      },
    })
  }

  const works = await prisma.work.findMany({
    select: { id: true, title: true, slug: true, description: true, content: true, titleI18n: true },
  })
  for (const row of works) {
    if (row.titleI18n) continue
    await prisma.work.update({
      where: { id: row.id },
      data: {
        titleI18n: { zh: row.title, en: null },
        slugI18n: { zh: row.slug, en: null },
        descriptionI18n: { zh: row.description, en: null },
        contentI18n: { zh: row.content, en: null },
      },
    })
  }

  const tutorials = await prisma.videoTutorial.findMany({
    select: { id: true, title: true, slug: true, description: true, titleI18n: true },
  })
  for (const row of tutorials) {
    if (row.titleI18n) continue
    await prisma.videoTutorial.update({
      where: { id: row.id },
      data: {
        titleI18n: { zh: row.title, en: null },
        slugI18n: { zh: row.slug, en: null },
        descriptionI18n: { zh: row.description, en: null },
      },
    })
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, nameI18n: true },
  })
  for (const row of categories) {
    if (row.nameI18n) continue
    await prisma.category.update({
      where: { id: row.id },
      data: {
        nameI18n: { zh: row.name, en: null },
        slugI18n: { zh: row.slug, en: null },
      },
    })
  }

  const tags = await prisma.tag.findMany({
    select: { id: true, name: true, nameI18n: true },
  })
  for (const row of tags) {
    if (row.nameI18n) continue
    await prisma.tag.update({
      where: { id: row.id },
      data: {
        nameI18n: { zh: row.name, en: null },
      },
    })
  }

  const settings = await prisma.settings.findUnique({ where: { id: "settings" } })
  if (settings) {
    await prisma.settings.update({
      where: { id: settings.id },
      data: {
        defaultLocale: settings.defaultLocale ?? "ZH",
        navI18n: settings.navI18n ?? { zh: settings.nav, en: null },
        pageCopyI18n: settings.pageCopyI18n ?? { zh: settings.pageCopy, en: null },
        aiAssistantI18n: settings.aiAssistantI18n ?? { zh: settings.aiAssistant, en: null },
        footerI18n: settings.footerI18n ?? { zh: settings.footer, en: null },
      },
    })
  }

  console.log("[i18n-backfill] done")
}

main()
  .catch((error) => {
    console.error("[i18n-backfill] failed", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
