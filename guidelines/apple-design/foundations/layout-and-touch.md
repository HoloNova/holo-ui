# Apple Layout, Touch & Spacing (布局、触控与栅格)

> **核心原则**：设计不是为了看起来好看，而是为了用起来自然。手指触碰屏幕的生理物理特征，决定了 Apple 界面的每一像素间距。

---

## 1. 44×44pt 触控黄金法则 (Hit Target Rule)

### 为什么是 44pt？
人类食指按压屏幕时的平均有效触控感应直径约为 **7mm~8mm**。在 Apple 标准视网膜屏幕密度下，这个物理尺寸精确对应 **44×44 pt**。

### 规则：
- 任何按钮、图标、可点击行、开关，其**点击感知热区不得小于 44×44px**。
- 如果视觉上图标只有 20×20px，必须通过 `padding` 或透明外层包裹器撑满 44px：

```css
/* 视觉上是 20px 图标，但点击区域是合规的 44px */
.apple-touch-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

---

## 2. 8pt 空间栅格体系 (Spatial Grid)

Apple 界面内部的一切尺寸排布，都是以 **8pt** 为基本步进单位展开的（微小间距采用 4pt 作为副阶）：

| 间距值 | 常见用途 |
|:---|:---|
| **4px** | 标签内微小间距、图标与微文字水平间距 |
| **8px** | 紧凑元素间距、按钮内垂直内边距、芯片列表间距 |
| **12px** | 列表单元格内部垂直内边距、卡片标题与正文间距 |
| **16px** | 标准页面左右外边距（iPhone）、标准卡片内边距 |
| **20px** | 大屏设备外边距（iPad / Desktop）、重要卡片外边距 |
| **24px** | 段落分块间距、功能模块之间垂直留白 |
| **32px / 40px** | 页面大分类之间的分隔留白 |

---

## 3. 平滑连续圆角 (Continuous Curvature / Squircle)

苹果产品的圆角从来不是标准的正圆弧（Circular Arc），而是高阶连续曲率曲线（Lamé Curve，俗称 **超椭圆 Squircle**）。

- **普通 CSS `border-radius` 的缺陷**：在直线转入弧线的一瞬间曲率突变，产生轻微的“尖锐折角感”。
- **Apple 标准圆角规格**：
  * **App 图标**：占尺寸宽度的 `22.37%`。
  * **系统级卡片**：`16px` ~ `20px`。
  * **弹窗与 Sheet**：`22px` ~ `28px`。
  * **小按钮**：`8px` ~ `12px`。
  * **胶囊按钮**：`9999px`。

---

## 4. 屏幕边缘与安全区 (Safe Area Insets)

任何 Apple 风格的 Web/移动端界面，必须在 CSS 中主动声明环境变量，适配刘海屏、灵动岛（Dynamic Island）和底部 Home 横条：

```css
/* 适配苹果设备刘海与底部横条 */
.apple-safe-container {
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}
```
