# Fanstudio 首页 Figma 设计规范

## 页面结构

```
Frame: HomePage (1440 x Auto)
├── HeroSection (1440 x 85vh min)
├── WorksGridSection - Design (1440 x Auto)
├── WorksGridSection - Development (1440 x Auto)
├── NotesSection (1440 x Auto)
├── TutorialsSection (1440 x Auto)
└── FooterSection (1440 x Auto)
```

---

## 1. Hero Section

### Frame 设置
- **名称**: HeroSection
- **宽度**: 1440px (Fill container)
- **高度**: Auto (min-height: 85vh)
- **Auto Layout**: Vertical
- **Padding**:
  - Desktop: 64px (top/bottom), 64px (left/right)
  - Tablet: 64px (top/bottom), 48px (left/right)
  - Mobile: 80px (top/bottom), 24px (left/right)
- **Gap**: 0
- **背景**: Aurora gradient overlay (opacity: 20-30%)

### 内容结构

#### 1.1 顶部标签行
- **Auto Layout**: Horizontal
- **Gap**: 12px
- **Align**: Left
- **Items**:
  - Badge: "VOL.XX"
    - Border: 1px, border-color/50
    - Padding: 4px 12px
    - Border radius: 999px
    - Font: Mono, 10px, uppercase, letter-spacing: 0.3em
    - Color: muted-foreground
  - Divider line: 48px width, 1px height, border color

#### 1.2 主标题 (H1)
- **Auto Layout**: Vertical
- **Gap**: 8px (between lines)
- **Font**: Serif
- **Size**:
  - Desktop: 96px (8xl)
  - Tablet: 72px (7xl)
  - Mobile: 48px (5xl)
- **Weight**: Bold (700)
- **Line height**: 0.95
- **Letter spacing**: Tight
- **Color**: Foreground
- **内容**:
  - Line 1: "你好，我是" (动画: SplitText, delay: 0.2s)
  - Line 2: "独立设计师 " + "FanStudio" (斜体)
    - "独立设计师" 动画: delay 0.5s
    - "FanStudio" 动画: 逐字符, delay 0.5s + 字符索引 * 0.05s

#### 1.3 描述文本
- **Margin top**: 24px
- **Font**: Sans-serif
- **Size**:
  - Desktop: 20px (xl)
  - Mobile: 18px (lg)
- **Color**: Muted-foreground
- **Max width**: 512px (lg)
- **Line height**: Relaxed
- **动画**: BlurText, delay: 0.8s

#### 1.4 AI 助手卡片
- **Margin top**: 32px
- **Max width**: 640px
- **Auto Layout**: Vertical
- **Border radius**: 16px
- **Padding**:
  - Desktop: 20px
  - Mobile: 16px
- **背景**: Gradient border effect
- **内容 Auto Layout**: Horizontal
- **Justify**: Space-between
- **Gap**: 8px
- **Items**:
  - Left group:
    - AI Badge (20px circle, foreground bg, "AI" text)
    - Text: "懒得翻页？我用 30 秒带你认识我。"
  - Right group (buttons):
    - Button 1: "快速推荐" + magic icon
    - Button 2: "打开助手" + arrow icon
    - Button style:
      - Border: 1px border
      - Padding: 6px 12px
      - Border radius: 999px
      - Font: 12px
      - Hover: bg-accent

#### 1.5 底部信息栏
- **Margin top**: 32px
- **Auto Layout**: Horizontal
- **Gap**: 16px
- **Align**: Center
- **Wrap**: Yes
- **Items**:
  - Avatar (48px circle, border: 2px, ring: 2px)
  - "关于" link (underline animation)
  - Divider "·"
  - Social links (微信、小红书、公众号等)
    - Font: 14px
    - Color: Muted-foreground
    - Hover: Foreground

#### 1.6 底部分割线
- **Position**: Absolute bottom
- **Width**: 100%
- **Height**: 1px
- **Color**: Border/50

---

## 2. Works Grid Section (设计作品)

### Frame 设置
- **名称**: WorksGridSection_Design
- **Auto Layout**: Vertical
- **Padding**:
  - Desktop: 96px (top/bottom), 64px (left/right)
  - Tablet: 96px (top/bottom), 48px (left/right)
  - Mobile: 64px (top/bottom), 24px (left/right)
- **Border top**: 1px, border/40

### 2.1 Section Header
- **Auto Layout**: Horizontal
- **Justify**: Space-between
- **Align**: Center
- **Margin bottom**: 40px
- **Items**:
  - Left group:
    - Title: "设计作品" (Serif, 36-48px, bold)
    - Divider line (64px, 1px, margin-top: 8px)
  - Right: "查看全部" link + arrow icon

### 2.2 Works Grid
- **Auto Layout**: Grid
- **Columns**:
  - Desktop: 4
  - Tablet: 4
  - Mobile: 2
- **Gap**: 20px
- **Items**: Work Card (最多4个)

#### Work Card 组件
- **Auto Layout**: Vertical
- **Border**: 1px, border/50
- **Border radius**: 12px
- **Background**: Card/50, backdrop-blur
- **Hover**: Glow border effect, scale(1.1)
- **Overflow**: Hidden

**Card 结构**:
1. Cover Image
   - **Aspect ratio**: 3:4 (可配置)
   - **Background**: Muted
   - **Image**: Object-fit: cover
   - **Badge** (如果 isFree):
     - Position: Absolute top-left (8px)
     - Text: "开源"
     - Background: Emerald-500/90
     - Padding: 4px 10px
     - Border radius: 6px
     - Font: 12px, medium, white

2. Card Content (Padding: 16px)
   - **Auto Layout**: Vertical
   - **Gap**: 4px

   - Title (16px, semibold, truncate)
   - Description (HTML, 14px, muted, line-clamp: 2)

   - Bottom row (margin-top: auto, padding-top: 12px):
     - **Auto Layout**: Horizontal
     - **Justify**: Space-between
     - **Align**: End

     - Tags group:
       - Category badge (primary/5 bg, primary/70 text)
       - Tags (最多3个, muted bg)
       - "+N" badge (如果超过3个)
       - Font: 10px
       - Padding: 2px 6px
       - Border radius: 4px
       - Max width: 56px, truncate

     - Price:
       - Font: Serif, 24px, bold
       - "¥" symbol: 14px, muted
       - Color: Foreground

---

## 3. Works Grid Section (开发作品)

与设计作品结构相同，仅标题和数据源不同：
- **Title**: "开发作品"
- **Fallback icon**: Code icon
- **Link**: /works/development

---

## 4. Notes Section (笔记)

### Frame 设置
- 与 Works Grid 相同的 padding 和 border

### 4.1 Section Header
- Title: "笔记"
- Link: /blog

### 4.2 Notes Grid
- **Grid**: 4列 (desktop), 2列 (mobile)
- **Gap**: 20px
- **Items**: Note Card (最多4个)

#### Note Card 组件
- 与 Work Card 结构类似
- **Cover aspect ratio**: 可配置
- **Fallback icon**: Article icon

**Card Content**:
- Title (16px, semibold, line-clamp: 2)
- Excerpt (HTML, 14px, muted, line-clamp: 2)
- Bottom row:
  - Date (12px, mono, muted/60)
  - Category + Tags (同 Work Card)

---

## 5. Tutorials Section (教程)

### Frame 设置
- 与其他 section 相同

### 5.1 Section Header
- Title: "教程"
- Link: /tutorials

### 5.2 Tutorials Grid
- **Grid**: 4列 (desktop), 2列 (mobile)
- **Gap**: 20px
- **Items**: Tutorial Card (最多4个)

#### Tutorial Card 组件
- 与 Work Card 结构类似
- **Cover aspect ratio**: 可配置
- **Fallback icon**: Video icon
- **Hover overlay**:
  - Background: Black/20
  - Play icon: 36px, white/90, center

**Card Content**:
- Title (16px, medium, line-clamp: 2)
- Description (HTML, 14px, muted, line-clamp: 2)
- Category + Tags

---

## 6. Footer Section

### Frame 设置
- **Auto Layout**: Vertical
- **Padding**: 48px (top/bottom), 64px (left/right)
- **Border top**: 1px, border/40

### 6.1 Footer Content
- **Auto Layout**: Horizontal (desktop) / Vertical (mobile)
- **Justify**: Space-between
- **Align**: Start (desktop) / Center (mobile)
- **Gap**: 16px

**Items**:
1. Left group:
   - Logo text (Serif, 18px, bold)
   - Copyright (12px, muted/70)
     - "© 2026 FanStudio · v1.0.0"

2. Middle: Pride gradient divider
   - Width: 128px
   - Height: 2px
   - Border radius: 999px
   - Opacity: 30%

3. Right: Social links
   - **Auto Layout**: Horizontal
   - **Gap**: 12px
   - **Wrap**: Yes
   - Font: 12px
   - Color: Muted/50
   - Hover: Foreground

### 6.2 Bottom Spacer (Mobile only)
- Height: 80px (为移动端底部导航留空间)

---

## 设计系统规范

### 颜色
- **Foreground**: 主文本色
- **Muted-foreground**: 次要文本色
- **Background**: 背景色
- **Card**: 卡片背景
- **Border**: 边框色
- **Accent**: 强调色/悬停色
- **Primary**: 主题色
- **Emerald-500**: 开源标签色

### 字体
- **Serif**: 标题、价格
- **Sans-serif**: 正文
- **Mono**: 代码、日期

### 间距系统
- **Section padding**: 64-96px (vertical), 24-64px (horizontal)
- **Card padding**: 16px
- **Grid gap**: 20px
- **Element gap**: 4-16px

### 圆角
- **Card**: 12px
- **Badge**: 4-6px
- **Button**: 999px (pill)
- **Avatar**: 999px (circle)

### 动画
- **Hover scale**: 1.1
- **Transition**: 200-300ms
- **Ease**: ease-in-out

### 响应式断点
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## Auto Layout 最佳实践

1. **所有容器使用 Auto Layout**
2. **使用 Fill container 而非固定宽度**
3. **使用 Hug contents 让内容决定高度**
4. **使用 Gap 而非 Margin 控制间距**
5. **使用 Padding 而非嵌套 Frame**
6. **使用 Min/Max 约束控制响应式**
7. **使用 Wrap 处理多行内容**
8. **使用 Absolute position 仅用于 overlay 元素**

---

## 组件变体建议

### WorkCard 变体
- Type: Design / Development
- State: Default / Hover
- Free: True / False

### Button 变体
- Size: Small / Medium / Large
- Variant: Primary / Secondary / Ghost
- State: Default / Hover / Active / Disabled

### Badge 变体
- Type: Category / Tag / Free / Count
- Color: Primary / Muted / Success

---

## 导出设置

- **Frame**: 1440px 宽度基准
- **Export**: PNG @2x, PDF (矢量)
- **Assets**: SVG (icons), WebP (images)
- **Design tokens**: 导出为 JSON

---

## 实现注意事项

1. 所有动画效果在 Figma 中用 Smart Animate 模拟
2. Glow border 效果使用 Drop shadow + Blur
3. Aurora background 使用渐变 + 噪点纹理
4. Pride gradient 使用多色渐变
5. Backdrop blur 使用 Background blur 效果
6. 响应式使用 Constraints + Auto Layout
7. 组件使用 Component + Variants
8. 文本样式使用 Text styles
9. 颜色使用 Color styles / Variables
10. 间距使用 Spacing tokens

---

生成日期: 2026-03-10
版本: 1.0.0
