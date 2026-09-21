# 🛠️ Apple 官方设计工具与资源全集 (Official Design Resources)

> **本文件整合自**：`https://developer.apple.com/design/resources/` 与 `https://developer.apple.com/design/`  
> **核心用途**：离线掌握苹果官方提供的全部设计原件、官方 Figma/Sketch 模板、字体包及专用设计工具，无需再回原网页查找。

---

## 1. 官方 UI Kits (Figma & Sketch 模板库)

苹果官方在 Figma Community 与官网维护了极高精度的矢量设计规范工程文件，包含全部系统控件、原生深浅色变体及真机外框（Device Bezels）：

| 平台规范 | 官方支持格式 | 核心包含内容 | 访问/下载入口 |
|:---|:---|:---|:---|
| **iOS & iPadOS** | Figma / Sketch | iPhone 16/15 界面全套、动态岛模组、锁屏 Widget、系统设置、导航栏、分段器 | [Apple Design Resources - iOS](https://developer.apple.com/design/resources/#ios-apps) / [Figma Community](https://www.figma.com/@apple) |
| **macOS** | Figma / Sketch | macOS 菜单栏、Dock 栏、标准窗口（Window Chrome）、控制中心、通知中心 | [Apple Design Resources - macOS](https://developer.apple.com/design/resources/#macos-apps) |
| **visionOS** | Figma / Sketch | 空间计算（Spatial Computing）窗口系统、玻璃材质画板、悬浮装饰、视线对焦态 | [Apple Design Resources - visionOS](https://developer.apple.com/design/resources/#visionos-apps) |
| **watchOS** | Figma / Sketch | 表盘复杂功能（Complications）、智能叠放（Smart Stack）、手势响应卡片 | [Apple Design Resources - watchOS](https://developer.apple.com/design/resources/#watchos-apps) |

---

## 2. 官方字体家族 (Apple Fonts)

官方字体免费提供给开发者在原型设计与开发中使用（支持 Mac 与 Windows）：

- **SF Pro (San Francisco)**：
  - 系统主力无衬线体，包含 9 种字重（Ultralight 到 Black）以及可变字体（Variable Font）轴。
  - 下载地址：[developer.apple.com/fonts/](https://developer.apple.com/fonts/)
- **SF Compact**：
  - 专为小表盘（Apple Watch）与紧凑信息设计的字形，直立笔画更紧凑。
- **SF Mono**：
  - 精确等宽体，带点状 0 和专为代码调校的连字特性。
- **New York**：
  - 苹果官方伴随字体（衬线 Serif），优雅温润，常用于 Apple Books 与高端杂志排版。

---

## 3. 矢量符号系统：SF Symbols 6+

- **资源定位**：专为匹配 San Francisco 字体而量身设计的 **7,000+ 矢量系统图标库**。
- **核心特性**：
  1. **字重自动对齐**：图标具有与文本字体完全一致的 9 种字重（从极细到特黑）。图标放在文字旁边时，粗细完全同步。
  2. **多色与分层渲染（Rendering Modes）**：支持单色（Monochrome）、层级（Hierarchical）、双色（Palette）和多元色彩（Multicolor）。
  3. **动态动画（Symbol Animations）**：内置弹跳（Bounce）、呼吸（Pulse）、微缩（Scale）、渐变色（Variable Color）等动效。
- **官方独立 App 下载**：[developer.apple.com/sf-symbols/](https://developer.apple.com/sf-symbols/)

---

## 4. 专属设计与生产力工具 (Apple Design Tools)

| 工具名称 | 功能描述 | 平台要求 | 下载/访问 |
|:---|:---|:---|:---|
| **Icon Composer** | 专用于为新代 iOS/macOS 制作分层、带实时动态属性和高光效果的 App 图标工具 | macOS | [Icon Composer](https://developer.apple.com/icon-composer/) |
| **Pass Designer** | 在 Mac 上可视化设计 Apple 钱包（Wallet）中的电子卡券、登机牌、会员卡 | macOS | [Pass Designer](https://developer.apple.com/pass-designer/) |
| **Reality Composer Pro** | 专为 visionOS 打造的 3D 空间交互设计、空间材质（MaterialX）与粒子迭代工具 | Xcode 内置 / macOS | [Reality Composer Pro](https://developer.apple.com/reality-composer-pro/) |
| **SF Symbols App** | 搜索 7000+ 图标、导出自定义符号 SVG 模板的桌面软件 | macOS | [SF Symbols App](https://developer.apple.com/sf-symbols/) |
