[English](README.md) | [简体中文](README_zh.md)

# Holo UI Vault

> 一个专为 **AI Agent（AI 编码助手）** 与开发者打造的 Agent-First 高质量 UI 代码与设计系统资产金库。解决现有 AI 技能仅有抽象文字指引却不提供真实前端代码的痛点，帮助 Agent 与人类以极低 Token 消耗检索、组装并产出零幻觉的高水准界面。

> [!IMPORTANT]
> **AI Agent 检索守则与上下文护栏 (Context Guards)**
> - **双向维度主索引**：请优先查阅 [`INDEX.json`](./INDEX.json)。支持按设计风格维度（`by_style`）或组件功能维度（`by_function`）精确定位。
> - **严禁递归扫描目录**：单次任务仅需定点读取目标 `*.snippet.html` 及对应的 `shared/base.css` 或 `tokens.css`，杜绝遍历全库浪费上下文。
> - **人类画廊隔离**：严禁在自动化生成流程中读取 `beautifului-components/index.html`（32KB 人类离线画廊页面，会白白消耗大量上下文 Tokens）。
> - **防过度组装天条**：在生成界面前务必参考 [`STYLE_AND_SELECTION_GUIDE.md`](./STYLE_AND_SELECTION_GUIDE.md)，杜绝给简单需求强塞重型复合组件。

---

## 1. 核心痛点与定位

目前行业内的大多数 AI "Skills" 或提示词库，主要停留在**抽象文字指引**层面（例如：“请使用 44pt 触控热区”、“使用柔和毛玻璃效果”）。这种指引存在严重缺陷：**它不直接提供经过验证的前端代码**，最终依然依赖大模型凭记忆去脑补 HTML 与 CSS，极易导致样式断裂、圆角怪异、动效生硬与状态缺失。

Holo UI Vault 采用**偏向代码库，但不仅是代码**的定位：
- **实打实的代码原语（Verified Code Primitives）**：提供开箱即用、剥离了展示包装的纯净 `.snippet.html`，配合独立的 CSS 自定义属性与动画关键帧。
- **权威设计规范与参数（Authoritative Design Guidelines）**：针对 Apple Human Interface 等成熟设计语言，直接提炼官方标准的 `tokens.css`、排印字阶、弹簧物理参数与无幻觉生成卡。
- **双向维度索引（Dual-Dimension Architecture）**：Agent 既可以按风格倾向（如 AI-Native 生产力风格）查找全套组件，也可以按业务功能（如推理思考链、Prompt 输入条、确认审批卡）跨库直达。
- **零框架运行时绑架（Zero Framework Lock-in）**：基于语义化 HTML 标记与标准 CSS 变量构建，无需复杂的前置构建步骤，可无缝移植入 React、Vue、Svelte 或纯原生项目。

---

## 2. 全局导航与索引

仓库提供结构化的元数据与指引，方便机器检索与人工查阅：

| 文件 | 类型 | 核心用途 |
|:---|:---|:---|
| [`INDEX.json`](./INDEX.json) | 机器主索引 | 双向检索核心：包含按风格索引（`by_style`）、按功能索引（`by_function`）与风格融合规则（`style_harmonization`）。 |
| [`ROUTER.json`](./ROUTER.json) | 极速路由器 | 轻量级单点分发路由表，将用户意图与组件 ID 一键映射至本地文件路径。 |
| [`STYLE_AND_SELECTION_GUIDE.md`](./STYLE_AND_SELECTION_GUIDE.md) | 技术指导文档 | 风格象限定位、AI 防过度组装四大天条与跨风格 Token 融合指南。 |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | 贡献者标准 | 外部贡献者收录新 UI 库、规范代码片段、注册双向索引的操作指南。 |

---

## 3. 已收录资产总索引

### A. 代码型组件库

| 库标识 | 来源站点 | 核心视觉风格 / 场景 | 组件数量 | 技术栈 | 状态 |
|:---|:---|:---|:---:|:---|:---:|
| [`beautifului-components`](./beautifului-components/) | [beautifului.dev](https://www.beautifului.dev/) | AI-Native 生产力风格（暗色优先、0.5px 发丝线、思考展开链、Prompt Bar） | 21 | Tailwind CSS v4 + OKLCH Tokens | 完整就绪 |

### B. 权威设计系统与 Tokens

| 规范标识 | 权威来源 | 核心设计哲学 / 资产 | 核心资产组成 | 状态 |
|:---|:---|:---|:---|:---:|
| [`guidelines/apple-design`](./guidelines/apple-design/) | [Apple HIG](https://developer.apple.com/design/) | Apple 人机交互哲学（Liquid Glass 流动玻璃、平滑超椭圆、弹簧物理、44pt 触控） | `tokens.css`、排印/材质/动效/布局指南、Prompt 预设卡 | 完整就绪 |

---

## 4. 目录拓扑结构

仓库遵循严格的模块化组织结构：

```
holo-ui/
|-- README.md                        # 英文主说明文档
|-- README_zh.md                     # 中文主说明文档
|-- INDEX.json                       # 双向主索引文件（风格维度 + 功能维度）
|-- ROUTER.json                      # 轻量意图分发路由器
|-- STYLE_AND_SELECTION_GUIDE.md     # 风格图谱与防过度组装指南
|-- CONTRIBUTING.md                  # 贡献者入库 SOP
|
|-- beautifului-components/          # 组件库：AI-Native 生产力风格
|   |-- catalog.json                 # 组件清单元数据
|   |-- COMPONENTS_GUIDE.md          # 库专属接入指引与 CSS 变量说明
|   |-- index.html                   # 离线画廊预览（人类开发者专用，Agent 勿读）
|   |-- shared/
|   |   `-- base.css                 # OKLCH 变量、动画关键帧与基础样式
|   |-- updater/                     # 源站更新感知探测工具（4 天缓存策略）
|   `-- components/
|       |-- ai-states/               # loading-state, thinking-state, streaming-text
|       |-- cards/                   # recommendation-card, context-cards, insight-cards, fine-tune-card
|       |-- code/                    # code-block
|       |-- data/                    # diff-table, records-table, filter-table
|       |-- input/                   # prompt-bar, chat-composer, search
|       |-- interaction/             # approval-card, tool-chips, selection-actions
|       |-- layout/                  # agent-screen
|       |-- navigation/              # sidebar-nav
|       |-- task-management/         # task-rows
|       `-- visualization/           # flowchart
|
`-- guidelines/apple-design/         # 设计规范：Apple Human Interface
    |-- tokens/
    |   `-- tokens.css               # Apple 液体玻璃、超椭圆与弹簧曲线变量
    |-- foundations/                 # 排印、材质、布局、动效基础规范
    |-- patterns/                    # 模态弹窗、底抽屉（Sheet）交互范式
    |-- resources/                   # 官方资源入口与 WWDC 设计精粹
    `-- PROMPT_PRESET.md             # 针对 AI Agent 的防幻觉生成预设卡
```

---

## 5. AI Agent 自动化集成流程

当 AI 编码助手需要从本仓库中获取组件并集成到目标项目时，请遵循以下流程：

```
                    [接收用户 UI 需求]
                            |
                            v
          [第 1 步：检索 INDEX.json / ROUTER.json]
          根据意图匹配设计风格或功能类别，定位目标组件 ID。
                            |
                            v
        [第 2 步：审视 STYLE_AND_SELECTION_GUIDE.md]
        对照防过度组装天条，剔除冗余重型组件，选定最小可用原语。
                            |
                            v
             [第 3 步：定点读取目标文件]
          - 获取单一 *.snippet.html 代码片段。
          - 获取 shared/base.css 或 tokens.css 对应变量。
          - 严禁读取 index.html 或全量遍历文件夹。
                            |
                            v
                  [第 4 步：注入目标代码]
          将纯净 DOM 结构与 CSS 样式规范输出至用户项目。
```

---

## 6. 跨体系风格融合范式

Holo UI Vault 支持将不同体系的优势进行解耦与组合。例如：取用 Beautiful UI 的**交互骨架**（如思考链折叠、审批卡片），外层覆以 Apple HIG 的**视觉材质与物理特性**：

```css
/* 引入 Apple 官方设计 Tokens */
@import "guidelines/apple-design/tokens/tokens.css";

/* 将 Beautiful UI 容器覆写为 Apple 材质规范 */
.beautifului-container {
  /* 替换冷色背景为 Apple 液体玻璃材质 */
  background: var(--apple-material-regular) !important;
  backdrop-filter: var(--apple-blur-regular) !important;
  -webkit-backdrop-filter: var(--apple-blur-regular) !important;

  /* 替换小圆角为 Apple 超椭圆平滑圆角与微反光边框 */
  border-radius: var(--apple-radius-xl) !important;
  border: 1px solid var(--apple-separator) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08) !important;

  /* 替换过渡曲线为 Apple 物理弹簧阻尼 */
  transition-timing-function: var(--apple-ease-spring) !important;
}
```

更多融合规则与反过度组装示例详见 [`STYLE_AND_SELECTION_GUIDE.md`](./STYLE_AND_SELECTION_GUIDE.md)。

---

## 7. 开源协议与知识产权

- **组件代码库**：`beautifului-components/` 中的组件代码遵循原作者的 [MIT License](https://www.beautifului.dev/license)。
- **设计规范与参数**：`guidelines/apple-design/` 中的参数归纳与总结属于教育性参考（Fair Use）。Apple、iOS、macOS、visionOS、SF Symbols 均为 Apple Inc. 的注册商标与知识产权。
- **仓库架构与工具链**：本仓库的索引架构、`INDEX.json`、`ROUTER.json` 及自动化维护工具均遵循 MIT License。
