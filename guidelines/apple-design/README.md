# 🍎 Apple Design System (HIG 核心规范与设计资产)

> **来源官网**：[developer.apple.com/design](https://developer.apple.com/design/)  
> **核心定位**：数字设计领域最严密的人机交互哲学、参数系统与设计规范白皮书。  
> **收录目的**：提炼 Apple 界面“高级感”背后的量化法则，将其转化为 **AI Agent 设计指令卡** 与 **可落地的 CSS Token**。

> [!CAUTION]
> **🤖 Agent 上下文防膨胀守则 (Context Guard)**  
> - ⚡ **编写代码任务**：**仅需读取 1~2 个文件**：[`PROMPT_PRESET.md`](./PROMPT_PRESET.md)（设计约束）或 [`tokens/tokens.css`](./tokens/tokens.css)（变量），严禁把整个 foundations/ 或 resources/ 全量读入上下文！
> - 🎯 **知识查阅任务**：按需定点单读对应的 1 篇 md 文档，用完即走。

---

## 🧭 知识库快速导航（按需定点查阅）

| 目录/文件 | 核心作用 | 适用人群 | 大小/成本 |
|:---|:---|:---:|:---:|
| 📄 [`PROMPT_PRESET.md`](./PROMPT_PRESET.md) | **【AI 助手指令卡】** 直接复制给 AI 的苹果风格开发硬性约束 | 🤖 AI Agent | ~1.5KB (极低) |
| 🎨 [`tokens/tokens.css`](./tokens/tokens.css) | **【纯 CSS 变量库】** 包含全套系统色、字阶、平滑圆角、材质模糊与弹簧参数 | 💻 前端开发 | ~4KB (极低) |
| 📐 [`foundations/typography.md`](./foundations/typography.md) | **【字体排印】** SF Pro 字阶对照表、等宽数字与文字层级透明度 | 🎨 UI 设计 / 开发者 | ~2KB |
| 💎 [`foundations/materials-and-vibrancy.md`](./foundations/materials-and-vibrancy.md) | **【材质光感】** 四层毛玻璃厚度、Liquid Glass、高光与 Vibrancy | 🎨 视觉质感还原 | ~2KB |
| 📱 [`foundations/layout-and-touch.md`](./foundations/layout-and-touch.md) | **【布局与触控】** 44pt 触控黄金法则、8pt 栅格律、平滑超椭圆（Squircle） | 📐 布局结构 | ~2KB |
| 🌊 [`foundations/motion-and-spring.md`](./foundations/motion-and-spring.md) | **【动效与物理阻尼】** 弹簧动画贝塞尔曲线、微小下沉反馈、降动效适配 | ✨ 动效交互 | ~2KB |
| 🪟 [`patterns/modals-and-sheets.md`](./patterns/modals-and-sheets.md) | **【覆盖层范式】** Bottom Sheet、Action Sheet、Alert 选型决策树 | 🧩 交互模式决策 | ~2KB |
| 🛠️ [`resources/official-downloads.md`](./resources/official-downloads.md) | **【官方资源清单】** 官方 Figma/Sketch UI Kits、SF Symbols、Fonts 官方入口 | 📦 设计师/素材查阅 | ~2KB |
| 🎬 [`resources/wwdc-design-videos.md`](./resources/wwdc-design-videos.md) | **【WWDC 设计精粹】** 《Meet Liquid Glass》等官方重磅讲座考点提炼 | 💡 设计思想探究 | ~2.5KB |
| 🧩 [`resources/hig-component-index.md`](./resources/hig-component-index.md) | **【HIG 全部组件字典】** 40+ 核心交互组件使用规则与禁忌速查 | 📖 交互词典 | ~3KB |

---

## 🌟 Apple 设计的三大核心灵魂 (Core Tenets)

```
                       ┌─────────────────────────┐
                       │  Deference (内容遵从)   │  ── 界面退后，内容至上
                       └────────────┬────────────┘
                                    │
                       ┌────────────┴────────────┐
                       │   Clarity (纯粹清晰)    │  ── 字阶严明，一目了然
                       └────────────┬────────────┘
                                    │
                       ┌────────────┴────────────┐
                       │    Depth (真实深度)     │  ── 材质通透，物理阻尼
                       └─────────────────────────┘
```

1. **Deference（遵从性）**：
   界面绝不喧宾夺主。没有刺眼的彩色大色块，背景多采用纯净的黑白灰搭配半透明模糊层，把视觉注意力完全交给用户的内容。
2. **Clarity（清晰度）**：
   全系统严格执行 SF Pro 字阶体系与 44pt 最小点击热区，文本有极明确的层级透明度区分（100%、60%、30%、18%）。
3. **Depth（空间深度感）**：
   通过分层（Z-Index）、磨砂玻璃模糊（Backdrop Blur）、环境反射光（Inner Specular Highlight）和弹簧物理（Spring Damping），让虚拟界面呈现出一种精密仪器般的物理质感。

---

## 🛠️ 如何在项目中落地使用？

### 方式 A：让 AI 按照 Apple 规范写界面
直接打开 [`PROMPT_PRESET.md`](./PROMPT_PRESET.md)，将里面的 Prompt 复制给你的 AI 编程助手（如 Claude / ChatGPT / Cursor），命令它按照该约束编写你的网页组件。

### 方式 B：在你的 HTML/CSS 中直接引入 Tokens
```html
<!-- 引入 Apple 官方参数化变量 -->
<link rel="stylesheet" href="path/to/guidelines/apple-design/tokens/tokens.css">

<style>
  .my-apple-card {
    background: var(--apple-bg-primary);
    border-radius: var(--apple-radius-lg); /* 16px 平滑圆角 */
    box-shadow: var(--apple-shadow-md);
    padding: calc(var(--apple-spacing-unit) * 2); /* 16px */
    transition: transform var(--apple-duration-fast) var(--apple-ease-spring);
  }
  .my-apple-card:active {
    transform: scale(0.96); /* 苹果经典的按压轻微下沉 */
  }
</style>
```
