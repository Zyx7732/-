import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("开始初始化数据库...")

  const adminEmail = "owner@local.test"
  const adminPassword = "ChangeMeAdmin123!"
  const viewerEmail = "viewer@local.test"
  const viewerPassword = "ChangeMeViewer123!"

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, name: "Fan", role: "ADMIN", bio: "一名热爱设计的创作者，专注于用户体验与视觉设计。" },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Fan",
      role: "ADMIN",
      bio: "一名热爱设计的创作者，专注于用户体验与视觉设计。",
    },
  })

  console.log("管理员用户已创建:", admin.email)

  // 创建体验账户（只读，用于公开演示）
  const demoPassword = await bcrypt.hash(viewerPassword, 10)
  const demo = await prisma.user.upsert({
    where: { email: viewerEmail },
    update: { password: demoPassword, name: "体验用户", role: "VIEWER" },
    create: {
      email: viewerEmail,
      password: demoPassword,
      name: "体验用户",
      role: "VIEWER",
      bio: "这是一个只读体验账户，可以浏览后台所有功能，但无法修改内容。",
    },
  })

  console.log("体验账户已创建:", demo.email)

  // 创建默认分类
  const postCategories = [
    { name: "设计方法", slug: "design-method" },
    { name: "工具技巧", slug: "tools" },
    { name: "设计思考", slug: "thinking" },
    { name: "视觉设计", slug: "visual" },
  ]

  const workCategories = [
    { name: "UI 设计", slug: "ui-design" },
    { name: "App 设计", slug: "app-design" },
    { name: "网页设计", slug: "web-design" },
    { name: "图标设计", slug: "icon-design" },
    { name: "插画", slug: "illustration" },
  ]

  for (const category of postCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        type: "POST",
      },
    })
  }

  for (const category of workCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        type: "WORK",
      },
    })
  }

  console.log("默认分类已创建")

  // 创建默认标签
  const tags = ["Figma", "设计系统", "用户体验", "原型设计", "配色", "字体"]

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    })
  }

  console.log("默认标签已创建")

  // 创建网站设置
  await prisma.settings.upsert({
    where: { id: "settings" },
    update: {},
    create: {
      id: "settings",
      siteName: "Fan's Studio",
      defaultLocale: "ZH",
      socialLinks: {
        weibo: "",
        xiaohongshu: "",
        dribbble: "",
        behance: "",
      },
      navI18n: {
        zh: {
          logoText: "Fan's Studio",
          worksDesign: "设计作品",
          worksDev: "开发作品",
          blog: "知识分享",
          tutorials: "视频教程",
          about: "关于我",
        },
        en: {
          logoText: "Fan's Studio",
          worksDesign: "Design",
          worksDev: "Development",
          blog: "Blog",
          tutorials: "Tutorials",
          about: "About",
        },
      },
    },
  })

  console.log("网站设置已创建")
  console.log("数据库初始化完成！")
  console.log("")
  console.log("本地管理员账号:")
  console.log(`  邮箱: ${adminEmail}`)
  console.log(`  密码: ${adminPassword}`)
  console.log("")
  console.log("本地只读账户:")
  console.log(`  邮箱: ${viewerEmail}`)
  console.log(`  密码: ${viewerPassword}`)
  console.log("")
  console.log("这些账号仅用于本地开发，请勿直接用于公开环境。")
}

main()
  .catch((e) => {
    console.error("数据库初始化失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
