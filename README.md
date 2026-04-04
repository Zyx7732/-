# Fan's Studio

一个面向设计师与独立创作者的开源个人网站模板，包含前台展示、后台管理、内容发布、作品售卖与 AI 助手能力。

这个仓库适合作为以下场景的起点：
- 个人作品集网站
- 设计师 / Design Engineer 个人主页
- 带后台管理的内容站
- 可售卖数字作品的独立站

## 特性

- 前台与后台一体化：基于 Next.js App Router，站点与管理后台使用同一套工程
- 内容管理：支持文章、设计作品、开发作品、教程、分类、标签
- 可视化配置：站点名称、导航、关于页、主题色、页脚和社交链接可在后台修改
- 作品交付：支持免费、开源和赞助型作品交付
- AI 助手：支持基于站内内容的文字问答与来源链接展示
- 多语言基础：内置中英文本地化结构
- 响应式：适配桌面端与移动端

## 截图

| 前台首页 | 后台首页 |
|---|---|
| ![前台首页](docs/screenshots/前台首页.png) | ![后台首页](docs/screenshots/后台首页.png) |

| 作品展示 | 后台编辑 |
|---|---|
| ![前台作品展示](docs/screenshots/前台作品展示.png) | ![后台作品编辑](docs/screenshots/后台作品编辑.png) |

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma
- MySQL
- NextAuth.js v5
- BlockNote
- Recharts

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

至少需要配置这些变量：

```env
DATABASE_URL="mysql://user:password@localhost:3306/fanstudio"
AUTH_SECRET="replace-with-a-random-secret"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

其余可选配置见 [`.env.example`](.env.example)。

### 3. 初始化数据库

```bash
npx prisma migrate deploy
npm run db:seed
```

`db:seed` 只用于本地开发初始化。它会创建本地示例账号，并在终端输出账号信息。

### 4. 启动开发环境

```bash
npm run dev
```

默认访问地址：
- 前台：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`

## 生产部署

请使用你自己的服务器、域名、环境变量和进程管理方式。仓库中的公开文档只保留泛化说明，不包含任何真实线上环境信息。

部署前建议阅读：
- [`docs/DEPLOY.md`](docs/DEPLOY.md)

## 安全说明

公开推送前请确认以下内容不在仓库中：
- `.env` 与任何真实密钥
- 支付证书、SMTP 凭据、私钥文件
- 服务器 IP、SSH 登录信息、内部运维脚本
- 用户上传内容与数据库备份

本仓库默认已忽略：
- `.env*`
- `cert/`
- `public/uploads/`
- 常见本地调试与构建产物

## 项目结构

```text
fanstudio/
├── src/
│   ├── app/
│   │   ├── (frontend)/        # 前台页面
│   │   ├── admin/             # 后台页面
│   │   └── api/               # API 路由
│   ├── components/            # UI 与业务组件
│   ├── hooks/                 # 自定义 hooks
│   └── lib/                   # 工具函数与服务层
├── prisma/
│   ├── schema.prisma          # 数据模型
│   └── seed.ts                # 本地初始化数据
├── public/                    # 静态资源
├── docs/                      # 项目文档
├── .env.example               # 环境变量模板
└── package.json
```

## 推送到 GitHub 前的建议

- 先检查 `git status`，确认没有把本地调试文件带上
- 先检查 `git diff -- README.md docs/DEPLOY.md prisma/seed.ts`
- 不要提交任何真实服务器脚本或线上域名配置
- 如果要公开仓库，建议把部署细节放到私有文档

## License

MIT
