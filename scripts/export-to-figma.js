#!/usr/bin/env node
/**
 * 将 fanstudio 前台页面设计导出到 Figma
 * 这个脚本会分析页面结构并生成 Figma 可以理解的设计数据
 */

const fs = require('fs');
const path = require('path');

// 页面设计规范
const designSpec = {
  name: "FanStudio 前台首页",
  description: "个人作品展示网站首页设计",

  // 颜色系统
  colors: {
    light: {
      background: "#fafafa",
      foreground: "#0a0a0a",
      card: "#ffffff",
      border: "#e4e4e7",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      accent: "#f4f4f5",
      primary: "#0a0a0a",
    },
    pride: {
      color1: "#D52D00",
      color2: "#EF7627",
      color3: "#FF9A56",
      color4: "#FFFFFF",
      color5: "#D162A4",
      color6: "#B55690",
      color7: "#A30262",
    }
  },

  // 字体系统
  typography: {
    fontFamily: {
      sans: "Geist Sans",
      mono: "Geist Mono",
      serif: "Serif",
    },
    sizes: {
      hero: "5xl-8xl", // 48-96px
      heading: "3xl-4xl", // 30-36px
      body: "base", // 16px
      small: "sm", // 14px
      tiny: "xs", // 12px
    }
  },

  // 间距系统
  spacing: {
    section: "py-16 md:py-24",
    container: "px-6 md:px-12 lg:px-16",
    gap: "gap-5",
  },

  // 圆角系统
  borderRadius: {
    base: "0.75rem",
    card: "rounded-xl",
    button: "rounded-full",
  },

  // 页面结构
  sections: [
    {
      name: "Hero Section",
      type: "hero",
      height: "min-h-[85vh]",
      components: [
        {
          type: "badge",
          content: "VOL.XX",
          style: "uppercase tracking-[0.3em] border rounded-full"
        },
        {
          type: "heading",
          level: 1,
          content: ["你好，", "我是 {siteName}"],
          fontSize: "5xl-8xl",
          animation: "split-text"
        },
        {
          type: "description",
          content: "设计师 / 开发者描述文案",
          fontSize: "lg-xl",
          animation: "blur-text"
        },
        {
          type: "ai-assistant-card",
          style: "gradient-border rounded-2xl p-4-5",
          buttons: ["快速推荐", "打开助手"]
        },
        {
          type: "profile",
          components: ["avatar", "about-link", "social-links"]
        }
      ]
    },
    {
      name: "Works Section - Design",
      type: "grid",
      columns: "grid-cols-2 md:grid-cols-4",
      gap: "gap-5",
      items: {
        type: "work-card",
        aspectRatio: "3/4",
        components: [
          "cover-image",
          "title",
          "description",
          "price",
          "category-tag",
          "tags"
        ]
      }
    },
    {
      name: "Works Section - Development",
      type: "grid",
      columns: "grid-cols-2 md:grid-cols-4",
      gap: "gap-5",
      items: {
        type: "work-card",
        aspectRatio: "3/4",
        components: [
          "cover-image",
          "title",
          "description",
          "price",
          "category-tag",
          "tags"
        ]
      }
    },
    {
      name: "Blog Section",
      type: "grid",
      columns: "grid-cols-2 md:grid-cols-4",
      gap: "gap-5",
      items: {
        type: "blog-card",
        aspectRatio: "3/4",
        components: [
          "cover-image",
          "title",
          "excerpt",
          "date",
          "category-tag",
          "tags"
        ]
      }
    },
    {
      name: "Tutorials Section",
      type: "grid",
      columns: "grid-cols-2 md:grid-cols-4",
      gap: "gap-5",
      items: {
        type: "tutorial-card",
        aspectRatio: "3/4",
        components: [
          "thumbnail",
          "play-overlay",
          "title",
          "description",
          "category-tag",
          "tags"
        ]
      }
    },
    {
      name: "Footer Section",
      type: "footer",
      components: [
        "logo-text",
        "copyright",
        "pride-gradient-divider",
        "social-links"
      ]
    }
  ],

  // 交互效果
  interactions: {
    hover: {
      cards: "scale-[1.1] transition-transform duration-300",
      links: "text-foreground/80 transition-colors",
      glowBorder: "glow-border effect"
    },
    animations: {
      fadeIn: "fade-content with delay",
      splitText: "character-by-character reveal",
      blurText: "blur-to-clear reveal"
    }
  }
};

// 生成 Figma 导入数据
function generateFigmaData() {
  const figmaData = {
    name: designSpec.name,
    type: "PAGE",
    children: []
  };

  // 为每个 section 创建 Frame
  designSpec.sections.forEach((section, index) => {
    const frame = {
      name: section.name,
      type: "FRAME",
      x: 0,
      y: index * 1200,
      width: 1440,
      height: section.type === "hero" ? 1000 : 800,
      backgroundColor: designSpec.colors.light.background,
      children: []
    };

    figmaData.children.push(frame);
  });

  return figmaData;
}

// 生成设计文档
function generateDesignDoc() {
  const doc = `# FanStudio 前台页面设计规范

## 颜色系统
${JSON.stringify(designSpec.colors, null, 2)}

## 字体系统
${JSON.stringify(designSpec.typography, null, 2)}

## 页面结构
${designSpec.sections.map(s => `### ${s.name}\n- 类型: ${s.type}\n- 组件: ${JSON.stringify(s.components || s.items, null, 2)}`).join('\n\n')}

## 交互效果
${JSON.stringify(designSpec.interactions, null, 2)}
`;

  return doc;
}

// 主函数
function main() {
  console.log('🎨 开始导出 FanStudio 设计到 Figma...\n');

  // 生成设计规范文档
  const designDoc = generateDesignDoc();
  const docPath = path.join(__dirname, '../tmp/figma-design-spec.md');
  fs.mkdirSync(path.dirname(docPath), { recursive: true });
  fs.writeFileSync(docPath, designDoc);
  console.log('✅ 设计规范文档已生成:', docPath);

  // 生成 Figma 数据
  const figmaData = generateFigmaData();
  const dataPath = path.join(__dirname, '../tmp/figma-data.json');
  fs.writeFileSync(dataPath, JSON.stringify(figmaData, null, 2));
  console.log('✅ Figma 数据已生成:', dataPath);

  // 生成完整设计规范
  const specPath = path.join(__dirname, '../tmp/design-spec.json');
  fs.writeFileSync(specPath, JSON.stringify(designSpec, null, 2));
  console.log('✅ 完整设计规范已生成:', specPath);

  console.log('\n📋 下一步操作:');
  console.log('1. 在 Figma 中创建新文件');
  console.log('2. 使用 Figma 插件导入设计数据');
  console.log('3. 或者手动根据设计规范在 Figma 中重建页面');
  console.log('\n💡 提示: 你可以使用 Figma 的 "Import" 功能或相关插件来导入 JSON 数据');
}

main();
