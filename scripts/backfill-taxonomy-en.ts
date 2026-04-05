import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const EXACT_NAME_MAP: Record<string, string> = {
  "文章": "Articles",
  "教程": "Tutorials",
  "视频教程": "Video Tutorials",
  "AI编程": "AI Programming",
  "设计作品": "Design Work",
  "开发作品": "Development Work",
  "产品设计": "Product Design",
  "品牌设计": "Brand Design",
  "用户体验": "User Experience",
  "前端动效": "Frontend Motion",
  "前端开发": "Frontend Development",
  "案例复盘": "Case Study",
  "无障碍": "Accessibility",
  "图标设计": "Icon Design",
  "网页设计": "Web Design",
  "视觉设计": "Visual Design",
  "设计思考": "Design Thinking",
  "设计方法": "Design Method",
  "原型设计": "Prototype Design",
  "组件库": "Component Library",
  "业务组件库": "Business Component Library",
  "设计系统": "Design System",
  "后台系统": "Admin System",
  "工作台": "Dashboard",
  "数据可视化": "Data Visualization",
  "内容管理": "Content Management",
  "企业官网": "Corporate Website",
  "作品集": "Portfolio",
  "工具技巧": "Tools & Tips",
  "插件开发": "Plugin Development",
  "小程序": "Mini Program",
  "B端": "B2B",
  "图表": "Charts",
  "字体": "Typography",
  "看板": "Kanban",
  "配色": "Color Palette",
  "博客": "Blog",
  "开源": "Open Source",
}

const PHRASE_MAP = [
  ["业务组件库", "Business Component Library"],
  ["数据可视化", "Data Visualization"],
  ["前端开发", "Frontend Development"],
  ["前端动效", "Frontend Motion"],
  ["用户体验", "User Experience"],
  ["品牌设计", "Brand Design"],
  ["产品设计", "Product Design"],
  ["案例复盘", "Case Study"],
  ["原型设计", "Prototype Design"],
  ["视频教程", "Video Tutorials"],
  ["图标设计", "Icon Design"],
  ["网页设计", "Web Design"],
  ["视觉设计", "Visual Design"],
  ["设计思考", "Design Thinking"],
  ["设计作品", "Design Work"],
  ["开发作品", "Development Work"],
  ["工具技巧", "Tools & Tips"],
  ["插件开发", "Plugin Development"],
  ["小程序", "Mini Program"],
  ["无障碍", "Accessibility"],
  ["组件库", "Component Library"],
  ["设计系统", "Design System"],
  ["后台系统", "Admin System"],
  ["内容管理", "Content Management"],
  ["企业官网", "Corporate Website"],
  ["作品集", "Portfolio"],
  ["工作台", "Dashboard"],
  ["详情页", "Detail Page"],
  ["列表", "Lists"],
  ["表单", "Forms"],
  ["图表", "Charts"],
  ["字体", "Typography"],
  ["看板", "Kanban"],
  ["配色", "Color Palette"],
  ["文章", "Articles"],
  ["教程", "Tutorials"],
  ["博客", "Blog"],
  ["开源", "Open Source"],
  ["测试", "Test"],
  ["设计", "Design"],
  ["开发", "Development"],
  ["组件", "Components"],
  ["视觉", "Visual"],
  ["业务", "Business"],
  ["内容", "Content"],
  ["企业", "Enterprise"],
  ["官网", "Website"],
  ["作品", "Work"],
  ["标签", "Tags"],
  ["分类", "Categories"],
  ["系统", "System"],
  ["版本", "Version"],
  ["更新", "Updates"],
  ["表格", "Tables"],
  ["导航", "Navigation"],
  ["B端", "B2B"],
  ["AI", "AI"],
] as const

const ACRONYM_MAP: Record<string, string> = {
  ai: "AI",
  ux: "UX",
  ui: "UI",
  app: "App",
  figma: "Figma",
  b2b: "B2B",
  cms: "CMS",
  saas: "SaaS",
  chatbi: "ChatBI",
}

function titleCaseToken(token: string): string {
  const lower = token.toLowerCase()
  if (ACRONYM_MAP[lower]) return ACRONYM_MAP[lower]
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function normalizeEnglish(value: string): string {
  return value
    .replace(/[（(]/g, " ")
    .replace(/[）)]/g, " ")
    .replace(/[、,，]/g, ", ")
    .replace(/[·•]/g, " ")
    .replace(/\//g, " / ")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s+/g, ", ")
    .trim()
}

function humanizeSlug(slug: string | null | undefined): string | null {
  const value = (slug ?? "").trim()
  if (!value) return null
  if (!/^[a-z0-9-]+$/i.test(value)) return null
  return value
    .split("-")
    .filter(Boolean)
    .map(titleCaseToken)
    .join(" ")
}

function slugifyEnglish(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function translateByPhrases(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null
  if (/^[\x00-\x7F]+$/.test(raw)) return normalizeEnglish(raw.split(/\s+/).map(titleCaseToken).join(" "))
  if (EXACT_NAME_MAP[raw]) return EXACT_NAME_MAP[raw]

  let i = 0
  const out: string[] = []
  while (i < raw.length) {
    const current = raw[i]

    if (/\s/.test(current)) {
      i += 1
      continue
    }
    if (/[\/、,，·•\-]/.test(current)) {
      out.push(current === "/" ? "/" : " ")
      i += 1
      continue
    }
    if (/[A-Za-z0-9]/.test(current)) {
      let j = i + 1
      while (j < raw.length && /[A-Za-z0-9]/.test(raw[j])) j += 1
      out.push(titleCaseToken(raw.slice(i, j)))
      i = j
      continue
    }

    const matched = PHRASE_MAP.find(([zh]) => raw.startsWith(zh, i))
    if (!matched) return null
    out.push(matched[1])
    i += matched[0].length
  }

  const normalized = normalizeEnglish(out.join(" "))
  return normalized || null
}

function pickCategoryEnglish(name: string, slug: string): string | null {
  return translateByPhrases(name) ?? humanizeSlug(slug)
}

function pickTagEnglish(name: string): string | null {
  return translateByPhrases(name)
}

function hasFilledEnglish(value: unknown): boolean {
  return !!(
    value &&
    typeof value === "object" &&
    typeof (value as { en?: unknown }).en === "string" &&
    (value as { en: string }).en.trim()
  )
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  console.log(`[taxonomy-en] start${dryRun ? " (dry-run)" : ""}`)

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, nameI18n: true, slugI18n: true, type: true },
    orderBy: { name: "asc" },
  })

  let categoryUpdated = 0
  for (const row of categories) {
    if (hasFilledEnglish(row.nameI18n)) continue
    const englishName = pickCategoryEnglish(row.name, row.slug)
    if (!englishName) {
      console.log(`[taxonomy-en] skip category ${row.id} ${row.name}`)
      continue
    }
    const nextNameI18n = {
      zh:
        row.nameI18n && typeof row.nameI18n === "object" && typeof (row.nameI18n as { zh?: unknown }).zh === "string"
          ? (row.nameI18n as { zh: string }).zh
          : row.name,
      en: englishName,
    }
    const nextSlugI18n = {
      zh:
        row.slugI18n && typeof row.slugI18n === "object" && typeof (row.slugI18n as { zh?: unknown }).zh === "string"
          ? (row.slugI18n as { zh: string }).zh
          : row.slug,
      en: slugifyEnglish(englishName) || row.slug,
    }
    console.log(`[taxonomy-en] category ${row.name} -> ${englishName}`)
    if (!dryRun) {
      await prisma.category.update({
        where: { id: row.id },
        data: { nameI18n: nextNameI18n, slugI18n: nextSlugI18n },
      })
    }
    categoryUpdated += 1
  }

  const tags = await prisma.tag.findMany({
    select: { id: true, name: true, nameI18n: true },
    orderBy: { name: "asc" },
  })

  let tagUpdated = 0
  for (const row of tags) {
    if (hasFilledEnglish(row.nameI18n)) continue
    const englishName = pickTagEnglish(row.name)
    if (!englishName) {
      console.log(`[taxonomy-en] skip tag ${row.id} ${row.name}`)
      continue
    }
    const nextNameI18n = {
      zh:
        row.nameI18n && typeof row.nameI18n === "object" && typeof (row.nameI18n as { zh?: unknown }).zh === "string"
          ? (row.nameI18n as { zh: string }).zh
          : row.name,
      en: englishName,
    }
    console.log(`[taxonomy-en] tag ${row.name} -> ${englishName}`)
    if (!dryRun) {
      await prisma.tag.update({
        where: { id: row.id },
        data: { nameI18n: nextNameI18n },
      })
    }
    tagUpdated += 1
  }

  console.log(`[taxonomy-en] done categories=${categoryUpdated} tags=${tagUpdated}`)
}

main()
  .catch((error) => {
    console.error("[taxonomy-en] failed", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
