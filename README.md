# 🎨 Holo UI Vault (精选高质量 UI 样式与组件仓库)

> 一个专为 **人类开发者** 与 **AI 编码助手（Agentic AI）** 共同消费的高质量、小众精选 UI 原语与组件库。  
> 核心目标：**收集小众高美感 UI 站点，彻底本地化存储，免联网直接调用，并配备源站更新感知机制。**

> [!IMPORTANT]
> **🤖 AI Agent 极速路由与上下文防膨胀军规 (Context Guard)**
> - ⚡ **极速寻址**：请直接读取根目录的 [`ROUTER.json`](./ROUTER.json)（仅 1.8KB），通过意图或组件 ID 获得直达文件路径，**无需扫描或遍历全库**。
> - 🛑 **严禁读取 `index.html`**：各子目录下的 `index.html` 为人类画廊预览页（30KB+），对编写代码无用且会浪费数千 tokens！
> - 🎯 **单文件定点读取**：获取组件只读目标 `*.snippet.html` + `base.css`；获取 Apple 规范只读 `PROMPT_PRESET.md` 或 `tokens.css`。

---

## 📖 仓库设计理念与核心原则

当我们在日常开发或由 AI Agent 自动搭建项目时，现有的各大通用组件库（如 Shadcn、AntD、Chakra 等）往往风格趋同，缺少独特的设计质感。互联网上有许多极具艺术感、小众且精致的 AI-Native / 现代 Web UI 作品。

为了将这些零散、各异的 UI 沉淀为可直接调用的“本地资产”，本仓库遵循以下 **四大核心原则**：

1. **彻底本地化（Local Self-Containment）**：
   - 所有组件的 HTML 结构、CSS 变量、关键帧动画必须完整落盘在本地。
   - 杜绝因源站关闭、域名失效或外网 CDN 断连导致组件代码无法获取的问题。
2. **人类与 AI 双层消费模型（Dual-Audience Architecture）**：
   - **对人类**：提供开箱即用的离线可视化画廊（`index.html`），可搜索、可筛选、支持暗色/亮色实时切换预览。
   - **对 AI Agent**：提供结构化元数据（`catalog.json`）、集成指引（`COMPONENTS_GUIDE.md`）、即用代码片段（`*.snippet.html`）与技术文档（`*.meta.md`）。
3. **源站更新感知（Source Site Tracking）**：
   - 每个 UI 库配备独立的 `updater/` 检测程序。
   - 默认采用 **4 天本地缓存策略**，日常调用零网络开销；支持手动 `--force` 实时对比源站 Hash 与组件列表。
4. **统一规范与即插即用（Zero-Vendor Lock-in）**：
   - 组件以纯 HTML + CSS 为核心承载，剥离对重型框架运行时的硬绑定，无论是 React、Vue、Svelte 还是纯 HTML 项目均可无缝适配。

---

## 🗂️ 统一收录目录结构规范

每个被收录的 UI 站点必须作为一个独立的顶层文件夹存放，命名规则为：`<library-name>-components/`。  
其内部必须严格遵循以下标准拓扑结构：

```
holo-ui-vault/
├── README.md                               ← 【全局总览】仓库规范与已收录 UI 库总索引
│
└── <library-name>-components/              ← 单个 UI 库独立目录（如 beautifului-components）
    ├── COMPONENTS_GUIDE.md                 ← 【Agent 入口】该库的专属接入指引、CSS 变量速查
    ├── catalog.json                        ← 【机器清单】所有组件的标签、分类、文件路径与使用场景
    ├── index.html                          ← 【人类看板】单文件离线可视化组件画廊（带搜索与主题切换）
    │
    ├── shared/                             ← 共享设计系统
    │   ├── base.css                        ← 提取出的完整 CSS 变量、Reset、全局关键帧与专用样式类
    │   └── tailwind-info.md                ← （可选）依赖框架版本或引入说明
    │
    ├── updater/                            ← 源站更新检测套件
    │   ├── check_updates.py                ← 自动化比对探测脚本
    │   ├── last_snapshot.json              ← 上次探测的指纹基线（构建 Hash、组件清单）
    │   ├── update_log.json                 ← 检测记录与 Agent 判定状态（use_local 标识）
    │   └── README.md                       ← 检测工具用法与参数说明
    │
    └── components/                         ← 组件源码目录（按业务语义分类）
        └── <category>/                     ← 分类文件夹（如 input, cards, navigation 等）
            ├── <component-id>.snippet.html ← 纯净代码片段（供 Agent/人类直接复制集成）
            ├── <component-id>.meta.md      ← 组件详细规格（DOM 说明、JS 交互代码、定制技巧）
            └── <component-id>.demo.html    ← （可选）该组件的独立单页预览 Demo
```

---

## 📑 组件文件三件套规范

收录任何组件时，在 `components/<category>/` 下必须生成标准化文件：

| 文件类型 | 命名规则 | 内容标准与职责 |
|:---|:---|:---|
| **代码片段** | `<id>.snippet.html` | 顶部必须包含结构化注释头（组件名、源站 Anchor、分类、依赖）。只保留核心组件的 DOM，**必须剔除**复制按钮、外层测试包装等无用代码。保证 HTML 实体已反转义。 |
| **技术文档** | `<id>.meta.md` | 记录组件属性、设计变体（Variants）、所用的 CSS 变量/类、**对应的 JavaScript 交互逻辑**（如折叠展开、输入联动、弹窗控制）及扩展建议。 |
| **独立预览** | `<id>.demo.html` | *(可选)* 包含自身样式的独立单页 HTML，可双击直接在浏览器中展示完整交互。 |

### `*.snippet.html` 头部注释标准模板
```html
<!--
  Component: [组件显示名称]
  Source: https://[源站域名]/#[component-anchor]
  Category: [所属分类]
  Description: [1-2句核心功能与视觉特性描述]
  Dependencies: shared/base.css, [Tailwind CSS v4 / 对应框架]
  Note: [关键交互逻辑或依赖说明]
-->
<div class="...">
  <!-- 核心代码 -->
</div>
```

---

## 🤖 AI Agent 自动化消费协议 (Agent Workflow)

当任何 AI 助手（如 Claude、GPT、Gemini、Cursor 等）需要从本仓库中获取组件并融入你的目标项目时，请让 Agent 按照以下标准 SOP 步骤执行：

```
           [用户提出 UI 需求]
                   │
                   ▼
     1. 读取根目录 README.md (了解当前有哪些 UI 库)
                   │
                   ▼
     2. 选定目标库，读取 <lib>/COMPONENTS_GUIDE.md 与 catalog.json
                   │
                   ▼
     3. 查验 <lib>/updater/update_log.json
        ├─ use_local == true  ──► 放心使用本地资产
        └─ use_local == false ──► 提示用户源站已更新 / 先行同步
                   │
                   ▼
     4. 根据需求关键词/标签在 catalog.json 检索组件 ID
                   │
                   ▼
     5. 抓取 components/.../<id>.snippet.html 获取 HTML
        抓取 components/.../<id>.meta.md 获取配套 JS 行为
                   │
                   ▼
     6. 检查目标项目是否已引入 shared/base.css 中的对应变量
                   │
                   ▼
             [输出/整合至目标项目]
```

---

## 🔄 源站更新感知机制标准 (Updater Protocol)

每一个纳入仓库的 UI 库，都必须在 `updater/` 目录下配备一个轻量探测工具，遵循统一的 **4天缓存规范**：

### 1. 检测逻辑
1. **优先读缓存**：读取 `update_log.json`，若 `now - last_checked < 4 天` 且未传递 `--force`，直接输出缓存状态，**不发出网络请求**，返回码 `0`。
2. **特征指纹提取**：
   - 抓取站点 HTML，提取构建资源 Hash（例如 Next.js `/_next/static/css/[hash].css`、Vite assets Hash 等）。
   - 提取站点侧边栏或导航菜单中的组件列表（ID 与显示名称）。
3. **差分比对**：
   - 与 `last_snapshot.json` 对比，计算出 CSS 是否变更、是否有新增组件（`added`）、删除组件（`removed`）或重命名组件（`renamed`）。
4. **日志持久化**：
   - 输出统一结构的 JSON，供外部脚本或 AI Agent 直接读取 `status` (`"up-to-date"` / `"update-available"` / `"error"`) 与 `use_local` (`true` / `false`)。

---

## 🛠️ 新 UI 站点收录标准操作流程 (New Site Onboarding SOP)

当你或 AI 发现并打算收录一个新的高品质小众 UI 站点时，请遵循以下 6 步流程：

- [ ] **Step 1: 站点技术特征分析**
  - 确认 CSS 架构（Tailwind v3/v4、CSS Modules、Vanilla CSS 还是内联变量）。
  - 提取色彩空间与主题模式（OKLCH、HSL、Hex 等，是否支持深浅色切换）。
  - 确认字体依赖（Inter、Geist、JetBrains Mono 等）。
- [ ] **Step 2: 沉淀全局设计系统 (`shared/base.css`)**
  - 提取全局 CSS 自定义属性（Tokens：`--page`, `--surface`, `--ink`, `--line` 等）。
  - 提取关键帧动画（`@keyframes`，如 shimmer, blink, float, pulse 等）。
  - 封装组件特定的特殊样式类。
- [ ] **Step 3: 批量提取组件代码 (`components/`)**
  - 为每个组件建立所属分类文件夹。
  - 生成标准的 `*.snippet.html`（剥离展示性壳子，保留纯净 DOM）。
  - 编写配套的 `*.meta.md`（补全交互说明与 JS 代码）。
- [ ] **Step 4: 构建机器索引 (`catalog.json` & `COMPONENTS_GUIDE.md`)**
  - 登记每个组件的 ID、名称、描述、分类、标签（Tags）、使用场景（Use cases）、动画与依赖。
  - 编写针对 AI Agent 的接入指南。
- [ ] **Step 5: 编写本地画廊看板 (`index.html`)**
  - 单文件 HTML，引入 `shared/base.css`。
  - 呈现侧边栏导航、实时关键词搜索、分类分割线、深浅色模式切换、一键直达本地 Snippet 和 Docs。
- [ ] **Step 6: 配置源站检测脚本 (`updater/`)**
  - 编写针对该站构建特征的 `check_updates.py`。
  - 记录初始 `last_snapshot.json` 与 `update_log.json`。
  - 在本根目录 `README.md` 的库清单中追加登记。

---

## 📚 已收录资产总索引 (Curated Vault Index)

### 1. 代码型组件库 (Component Libraries)
| 库标识 | 来源站点 | 核心视觉风格 / 场景 | 组件数量 | 技术栈 | 维护状态 |
|:---|:---|:---|:---:|:---|:---:|
| [`beautifului-components`](./beautifului-components/) | [beautifului.dev](https://www.beautifului.dev/) | **AI-Native 界面原语**（思考折叠、流式文本、HITL 审批、Prompt Bar、任务行、微调控制、CRM 表格等） | 21 | Tailwind CSS v4 + OKLCH Tokens | ✅ 完整就绪 |
| *(待收录)* | *Next Curated Site* | 持续收录中... | - | - | 📋 计划中 |

### 2. 设计规范与知识库 (Design Systems & Guidelines)
| 规范标识 | 来源权威 | 核心设计哲学 / 资产 | 核心资产组成 | 维护状态 |
|:---|:---|:---|:---|:---:|
| [`guidelines/apple-design`](./guidelines/apple-design/) | [Apple HIG](https://developer.apple.com/design/) | **数字工业美学圣经**（遵从性 Deference、清晰度 Clarity、物理深度 Depth、Liquid Glass、44pt 触控） | 🤖 AI Prompt 预设卡<br>🎨 完整 `tokens.css`<br>📐 字体/材质/栅格/动效规范 | ✅ 完整就绪 |

## 🧭 风格决策与防过度组装 (Style & Selection Guide)

在让 AI Agent 或人工构建页面前，请参阅全局：
📄 **[`STYLE_AND_SELECTION_GUIDE.md`](./STYLE_AND_SELECTION_GUIDE.md)**
- **风格象限定位**：清晰定义各类收录 UI 的设计语境（如 Beautiful UI 的极简科技冷峻感 vs Apple 的人文流动玻璃质感），避免风格错配。
- **AI 防过度组装四大天条**：严格执行奥卡姆剃刀、动效克制、场景降级与严禁科学怪人式混搭，杜绝把简单需求做成“全家桶”。

---

## ⚖️ 开源合规与知识产权声明 (License & Intellectual Property)

本仓库作为开源聚合与设计知识沉淀项目，遵循严格的开源与版权规范：

1. **代码组件库 (Code Libraries)**：
   - [`beautifului-components`](./beautifului-components/) 源码遵循原作者 Shane Levine 发布的 **[MIT License](https://www.beautifului.dev/license)**，允许自由使用、分发与修改，且已保留原始版权声明。
   - 未来任何新收录的组件代码，均需核实并采用符合宽松开源协议（MIT / Apache 2.0 / BSD / CC0）的资源。
2. **设计规范与知识库 (Design Guidelines)**：
   - [`guidelines/apple-design`](./guidelines/apple-design/) 中的设计规范、参数数值与总结性文档属于教育性与参考性提炼（Fair Use / Educational Curation）。
   - Apple、iOS、macOS、visionOS、SF Symbols 及 Human Interface Guidelines 均为 Apple Inc. 的注册商标与版权资产。
   - 本仓库**不直接分发**苹果受版权保护的专属二进制安装包（如原始 SF 字体文件、SF Symbols 二进制包），仅提供官方合规下载入口与自主编写的 CSS Tokens 实现。
3. **本仓库自身开源协议**：
   - 仓库架构、路由程序（`ROUTER.json`）、探测脚本（`updater/`）以及自主编写的整理文档遵循 **MIT License**。

---

## 💡 维护与贡献建议
- **代码库更新检测**：推荐在启动新任务前，对组件库目录运行一次 `python updater/check_updates.py --force`。
- **设计知识库复用**：让 AI 搭建具备高质感或拟物毛玻璃界面时，直接挂载 `guidelines/apple-design/PROMPT_PRESET.md`。
- **扩展性**：无论引入哪个 UI 库或设计系统，请始终保持“**对人类友好、对 Agent 友好、零运行时绑架**”的三维平衡。


