# 组件交付依赖：静态审计与决策

## 已核实（非 UI 验收）

- `python tools/audit_dependencies.py` 对 94 个规范组件做**静态模式扫描**：观察到直接 import `react` 30、`framer-motion` 26、`lucide-react` 16、`three` 3。仅捕获脚本识别的字面 import/require，不等于完整运行依赖。
- 静态扫描观察到两个相对 import，均指向 `rewampui-components/shared/siteTheme.js`，在 `REGISTRY.json` 的 `resources` 声明。实测 full 模式针对 `day-night-sky-toggle` 和 `landscape-orb-toggle` 都返回该 helper 的源码；实际构建的 wheel 中也包含该文件（`python tools/audit_dependencies.py --wheel dist/holo_ui_mcp-0.0.1-py3-none-any.whl`）。未提供 wheel 时工具报告 `unverified`，不从 `force-include` 推断实际包含。
- `ld-wave` / `ld-ripple` 只有随包 CSS 的基础选择器 `.ld-wave-bar` / `.ld-ripple-ring` 才承担主要动画；额外修饰类没有独立规则不意味着需要 Tailwind。扫描整个 snippet 中的 `flex` 会误把内联样式当成工具类。
- ThemeToggle 的 `shared/base.css` 包含已编译的 Tailwind 形态规则，包括 `.dark\:toggles-dev--translate-y-\[50\%\]`。类名长得像工具类不等于宿主需要 Tailwind 编译器。其按钮内联 `onclick` 只切换自身 `.dark`，不提供页面级主题状态。
- BeautifulUI 的 snippet 有明确的 Tailwind utility 与 v4 依赖说明，而 `shared/base.css` 主要是 tokens/动画，且包含 Google Fonts `@import`。RewampUI 的组件同样使用 utility 类；这些是宿主样式前提的静态证据，而不是全库按类名前缀推导出的精确覆盖率。

## 尚未验证

本轮遵照用户要求，**不进行 UI/浏览器测试或验收**。ThemeToggle 的实际明暗视觉效果、全部 utility 是否由随包 CSS 覆盖、三卡片视觉与触控表现均留给用户。扫描不覆盖动态 `import()`、CSS `@import`/`url()`、HTML 资源属性或运行时拼接类名；“扫描到的本地 import 无缺失”不能写成“全部资产无缺失”。

## 依赖展示的下一步决策（暂不实现）

采用小规模混合方案，而不是请求时正则解析 snippet：

1. 在构建期从组件源码提取**可识别的直接 npm import**，生成按 canonical ID 索引的派生依赖视图，并在 `--check` 中重新生成比对；遇到解析不了的语法须标记待核实，不得静默称作零依赖。源码是包导入的事实源；`REGISTRY.json` 仍是检索元数据和资源声明的唯一事实源。
2. 宿主 CSS 前提按经过验证的来源库约定记录，少数例外单列；这不是靠类名前缀可靠生成的内容。未完成用户 UI 验收前，不将 ThemeToggle 的宿主要求定为最终结论。
3. 如实施，需给派生视图定义 schema、生成/检查命令、wheel/sdist 包含规则、启动加载及失配测试；`mode=summary` 必须只使用内存元数据，**不得每次查询读 snippet/CSS/helper**。full 中仍保留完整资源交付。

目前没有新增依赖注册表字段或 MCP 输出。先让交付前提有证据，再决定是否值得为 94 个组件增加派生文件与展示契约。
