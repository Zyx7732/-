import prisma from "@/lib/prisma"
import { rebuildKnowledge } from "@/lib/ai/knowledge"

type BlockNoteText = {
  type: "text"
  text: string
}

type BlockNoteParagraph = {
  id: string
  type: "paragraph"
  props: Record<string, unknown>
  content: BlockNoteText[]
}

function blockParagraph(id: string, text: string): BlockNoteParagraph {
  return {
    id,
    type: "paragraph",
    props: {},
    content: [{ type: "text", text }],
  }
}

function blockDoc(lines: string[]): BlockNoteParagraph[] {
  return lines.map((line, index) => blockParagraph(`p-${index + 1}`, line))
}

async function ensureAdminUserId(): Promise<string> {
  const admin =
    (await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    })) ??
    (await prisma.user.create({
      data: {
        email: `ai-test-admin-${Date.now()}@example.com`,
        password: "not-used-for-local-seed",
        role: "ADMIN",
        name: "AI Test Admin",
      },
      select: { id: true },
    }))

  return admin.id
}

async function upsertCategory(name: string, slug: string, type: "POST" | "WORK" | "TUTORIAL") {
  return prisma.category.upsert({
    where: { slug },
    update: { name, type },
    create: { name, slug, type },
    select: { id: true },
  })
}

async function upsertTag(name: string) {
  return prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name },
    select: { id: true, name: true },
  })
}

async function main() {
  const authorId = await ensureAdminUserId()

  const [postCategory, designCategory, devCategory, tutorialCategory] = await Promise.all([
    upsertCategory("AI 测试文章", "ai-test-posts", "POST"),
    upsertCategory("AI 测试设计作品", "ai-test-design-works", "WORK"),
    upsertCategory("AI 测试开发作品", "ai-test-dev-works", "WORK"),
    upsertCategory("AI 测试教程", "ai-test-tutorials", "TUTORIAL"),
  ])

  const [tagBrand, tagUX, tagFrontend, tagCaseStudy, tagAccessibility] = await Promise.all([
    upsertTag("品牌设计"),
    upsertTag("用户体验"),
    upsertTag("前端开发"),
    upsertTag("案例复盘"),
    upsertTag("无障碍"),
  ])

  const posts = [
    {
      title: "【测试】如何从 0 到 1 做个人品牌官网",
      slug: "ai-test-personal-brand-website",
      excerpt: "<p>围绕定位、内容、视觉、转化四个模块拆解个人品牌站搭建方法。</p>",
      content: blockDoc([
        "第一步先定义你要被记住的关键词，例如“品牌体验设计”。",
        "第二步整理代表项目，必须写清背景、目标、过程和结果。",
        "第三步让访客在 30 秒内找到联系方式和合作入口。",
      ]),
      coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      categoryId: postCategory.id,
      tagIds: [tagBrand.id, tagCaseStudy.id],
      sortOrder: 1,
    },
    {
      title: "【测试】设计师作品集文案模板",
      slug: "ai-test-portfolio-copy-template",
      excerpt: "<p>给你一套可直接套用的作品集文案结构，减少表达成本。</p>",
      content: blockDoc([
        "建议每个作品都包含一句结论：你解决了什么问题。",
        "展示过程时避免流水账，重点写关键决策与取舍。",
        "最后加上结果指标，例如转化率提升、跳出率下降等。",
      ]),
      coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
      categoryId: postCategory.id,
      tagIds: [tagUX.id, tagCaseStudy.id],
      sortOrder: 2,
    },
    {
      title: "【测试】前台交互细节清单",
      slug: "ai-test-frontend-interaction-checklist",
      excerpt: "<p>整理了 20 条前台可感知交互细节，覆盖加载、反馈、错误与可访问性。</p>",
      content: blockDoc([
        "按钮点击后要有状态反馈，避免用户误判为无响应。",
        "加载状态建议提供骨架屏，而不是纯转圈动画。",
        "输入框错误信息要明确可操作，不要只写“输入有误”。",
      ]),
      coverImage: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=1200&q=80",
      categoryId: postCategory.id,
      tagIds: [tagFrontend.id, tagAccessibility.id],
      sortOrder: 3,
    },
  ]

  for (const post of posts) {
    const existed = await prisma.post.findUnique({
      where: { slug: post.slug },
      select: { id: true },
    })
    if (existed) {
      await prisma.post.update({
        where: { id: existed.id },
        data: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          categoryId: post.categoryId,
          sortOrder: post.sortOrder,
          status: "PUBLISHED",
          tags: { set: post.tagIds.map((id) => ({ id })) },
        },
      })
    } else {
      await prisma.post.create({
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          status: "PUBLISHED",
          coverRatio: "3:4",
          categoryId: post.categoryId,
          authorId,
          sortOrder: post.sortOrder,
          tags: { connect: post.tagIds.map((id) => ({ id })) },
        },
      })
    }
  }

  const works = [
    {
      title: "【测试】SaaS 仪表盘重设计",
      slug: "ai-test-saas-dashboard-redesign",
      workType: "DESIGN" as const,
      description: "面向中后台产品的仪表盘重设计，目标是提升信息可读性与操作效率。",
      content: blockDoc([
        "项目背景：原有仪表盘信息密度高、结构混乱，用户决策效率低。",
        "设计动作：重构信息层级，建立卡片化数据优先级和异常状态提示规范。",
        "结果：关键任务完成时间下降 26%，误操作率下降 18%。",
      ]),
      coverImage: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80",
      ],
      categoryId: designCategory.id,
      tagIds: [tagUX.id, tagCaseStudy.id],
      sortOrder: 1,
    },
    {
      title: "【测试】设计系统官网模板",
      slug: "ai-test-design-system-site",
      workType: "DESIGN" as const,
      description: "用于展示组件规范、品牌规则与设计资产下载的官网模板。",
      content: blockDoc([
        "核心模块：组件总览、设计原则、品牌资产、更新日志。",
        "重点体验：快速检索、文档结构清晰、视觉一致性。",
      ]),
      coverImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1000&q=80",
      ],
      categoryId: designCategory.id,
      tagIds: [tagBrand.id, tagUX.id],
      sortOrder: 2,
    },
    {
      title: "【测试】作品管理后台（Next.js）",
      slug: "ai-test-portfolio-admin-nextjs",
      workType: "DEVELOPMENT" as const,
      description: "为设计师个人站提供内容管理、媒体上传和发布流程的后台系统。",
      content: blockDoc([
        "技术栈：Next.js + Prisma + MySQL。",
        "功能：文章、作品、教程、分类标签、媒体上传、站点设置。",
        "特色：支持前台主题配置与移动端适配。",
      ]),
      coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80",
      ],
      categoryId: devCategory.id,
      tagIds: [tagFrontend.id, tagAccessibility.id],
      sortOrder: 1,
    },
  ]

  for (const work of works) {
    const existed = await prisma.work.findUnique({
      where: { slug: work.slug },
      select: { id: true },
    })
    if (existed) {
      await prisma.work.update({
        where: { id: existed.id },
        data: {
          title: work.title,
          workType: work.workType,
          description: work.description,
          content: work.content,
          coverImage: work.coverImage,
          images: work.images,
          categoryId: work.categoryId,
          sortOrder: work.sortOrder,
          status: "PUBLISHED",
          isFree: true,
          tags: { set: work.tagIds.map((id) => ({ id })) },
        },
      })
    } else {
      await prisma.work.create({
        data: {
          title: work.title,
          slug: work.slug,
          workType: work.workType,
          description: work.description,
          content: work.content,
          coverImage: work.coverImage,
          images: work.images,
          status: "PUBLISHED",
          coverRatio: "3:4",
          categoryId: work.categoryId,
          authorId,
          sortOrder: work.sortOrder,
          isFree: true,
          tags: { connect: work.tagIds.map((id) => ({ id })) },
        },
      })
    }
  }

  const tutorials = [
    {
      title: "【测试】10 分钟了解作品集首页结构",
      slug: "ai-test-portfolio-home-structure",
      description: "讲解作品集首页模块顺序和信息组织原则。",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
      categoryId: tutorialCategory.id,
      tagIds: [tagUX.id],
      sortOrder: 1,
    },
    {
      title: "【测试】设计师如何写项目复盘",
      slug: "ai-test-case-study-writing",
      description: "给出案例复盘通用模板，帮助你把过程讲清楚。",
      videoUrl: "https://www.bilibili.com/video/BV1GJ411x7h7",
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
      categoryId: tutorialCategory.id,
      tagIds: [tagCaseStudy.id],
      sortOrder: 2,
    },
  ]

  for (const tutorial of tutorials) {
    const existed = await prisma.videoTutorial.findUnique({
      where: { slug: tutorial.slug },
      select: { id: true },
    })
    if (existed) {
      await prisma.videoTutorial.update({
        where: { id: existed.id },
        data: {
          title: tutorial.title,
          description: tutorial.description,
          videoUrl: tutorial.videoUrl,
          thumbnail: tutorial.thumbnail,
          coverRatio: "3:4",
          categoryId: tutorial.categoryId,
          sortOrder: tutorial.sortOrder,
          tags: { set: tutorial.tagIds.map((id) => ({ id })) },
        },
      })
    } else {
      await prisma.videoTutorial.create({
        data: {
          title: tutorial.title,
          slug: tutorial.slug,
          description: tutorial.description,
          videoUrl: tutorial.videoUrl,
          thumbnail: tutorial.thumbnail,
          coverRatio: "3:4",
          categoryId: tutorial.categoryId,
          sortOrder: tutorial.sortOrder,
          tags: { connect: tutorial.tagIds.map((id) => ({ id })) },
        },
      })
    }
  }

  await prisma.settings.upsert({
    where: { id: "settings" },
    update: {
      siteName: "FanStudio AI 测试站",
      about: {
        profileCard: {
          studioName: "FanStudio",
          personalName: "测试设计师",
          personalTitle: "品牌与体验设计师",
        },
        intro: "我专注品牌体验与数字产品设计，擅长将复杂需求转化为清晰可执行的界面方案。",
        workExperience: [
          {
            company: "某科技公司",
            role: "高级产品设计师",
            period: "2021-2025",
            description: "负责核心业务中后台与增长项目的体验升级。",
          },
        ],
        education: [
          {
            school: "某艺术学院",
            degree: "视觉传达设计",
            period: "2015-2019",
          },
        ],
        skills: [
          { name: "UI/UX", level: "高级" },
          { name: "Design System", level: "高级" },
          { name: "Frontend Collaboration", level: "中级" },
        ],
      },
      socialLinks: {
        email: "hello@example.com",
        github: "https://github.com/example",
      },
    },
    create: {
      id: "settings",
      siteName: "FanStudio AI 测试站",
      about: {
        profileCard: {
          studioName: "FanStudio",
          personalName: "测试设计师",
          personalTitle: "品牌与体验设计师",
        },
        intro: "我专注品牌体验与数字产品设计，擅长将复杂需求转化为清晰可执行的界面方案。",
      },
      socialLinks: {
        email: "hello@example.com",
      },
    },
  })

  await rebuildKnowledge()

  const [postCount, workCount, tutorialCount, sourceCount, chunkCount, assetCount] = await Promise.all([
    prisma.post.count({ where: { slug: { startsWith: "ai-test-" } } }),
    prisma.work.count({ where: { slug: { startsWith: "ai-test-" } } }),
    prisma.videoTutorial.count({ where: { slug: { startsWith: "ai-test-" } } }),
    prisma.knowledgeSource.count({ where: { status: "ACTIVE" } }),
    prisma.knowledgeChunk.count(),
    prisma.knowledgeAsset.count(),
  ])

  console.log("AI 测试数据准备完成：")
  console.log(`- 测试文章: ${postCount}`)
  console.log(`- 测试作品: ${workCount}`)
  console.log(`- 测试教程: ${tutorialCount}`)
  console.log(`- 知识源: ${sourceCount}`)
  console.log(`- 知识切片: ${chunkCount}`)
  console.log(`- 知识图片资产: ${assetCount}`)
}

main()
  .catch((error) => {
    console.error("[seed-ai-test-data] failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

