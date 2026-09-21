# Apple Typography (字体排印体系)

> **核心原则**：文字不仅仅是信息的载体，它是 Apple 界面的骨架。苹果界面的“高级感”，60% 来自于对字号、字重、行高与字距（Tracking）的严密控制。

---

## 1. 字体家族 (Font Families)

- **San Francisco (SF Pro)**：iOS、macOS、iPadOS 的系统无衬线体。在 20pt 以下自动使用 `SF Pro Text`（字怀大、字距宽、易读），在 20pt 及以上切换为 `SF Pro Display`（字怀紧凑、精致优雅）。
- **New York**：苹果官方设计的过渡衬线体（Serif），常用于阅读类、图书、高端品牌类展示场景。
- **SF Mono**：等宽字体，用于代码块、时钟、金融数字展示。

### Web 标准声明
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
```

---

## 2. 官方 Type Scale 尺度对照表

在开发任何 Apple 风格的 Web/原生界面时，直接对照下表设置 CSS：

| 样式名称 (Style) | 字号 (Size) | 默认字重 (Weight) | 行高 (Leading) | 字间距 (Tracking) | 典型应用场景 |
|:---|:---:|:---:|:---:|:---:|:---|
| **Large Title** | `34px` | Bold (`700`) | `41px` | `+0.37px` | 页面一级主标题（大标题折叠前） |
| **Title 1** | `28px` | Bold (`700`) | `34px` | `+0.36px` | 关键分块大标题 |
| **Title 2** | `22px` | Bold (`700`) | `28px` | `+0.35px` | 卡片标题、模态框主标题 |
| **Title 3** | `20px` | Semibold (`600`) | `25px` | `+0.38px` | 分组列表小标题 |
| **Headline** | `17px` | Semibold (`600`) | `22px` | `-0.41px` | 单元格主文本加粗、突出行 |
| **Body** | `17px` | Regular (`400`) | `22px` | `-0.41px` | 标准正文、列表文本默认项 |
| **Callout** | `16px` | Regular (`400`) | `21px` | `-0.32px` | 醒目注释、辅助提示框 |
| **Subheadline** | `15px` | Regular (`400`) | `20px` | `-0.24px` | 列表二级副标题、元数据行 |
| **Footnote** | `13px` | Regular (`400`) | `18px` | `-0.08px` | 底部说明文字、表单附注 |
| **Caption 1** | `12px` | Regular (`400`) | `16px` | `0.00px` | 标签栏文字、徽章数字 |
| **Caption 2** | `11px` | Regular (`400`) | `13px` | `+0.07px` | 极小辅助提示、时钟标签 |

---

## 3. 等宽数字（Tabular Figures）
Apple 在展示计时器、价格变动、股票波动时，一定会开启等宽数字，避免数字跳动导致周围文字抖动：

```css
/* 开启等宽数字 */
font-variant-numeric: tabular-nums;
```

---

## 4. 动态文本层级色彩应用 (Text Color Hierarchy)

文字不能全用纯黑或纯白，而是通过 **不透明度（Opacity）** 传递重要度：

- **一级主要文本（Primary）**：
  - 浅色：`#000000`
  - 深色：`#FFFFFF`
- **二级辅助文本（Secondary）**：
  - 浅色：`rgba(60, 60, 67, 0.60)`
  - 深色：`rgba(235, 235, 245, 0.60)`
- **三级弱化文本（Tertiary / Placeholder）**：
  - 浅色：`rgba(60, 60, 67, 0.30)`
  - 深色：`rgba(235, 235, 245, 0.30)`
- **四级禁用/边框文本（Quaternary）**：
  - 浅色：`rgba(60, 60, 67, 0.18)`
  - 深色：`rgba(235, 235, 245, 0.16)`
