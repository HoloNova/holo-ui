# 组件交付依赖：静态审计与决策

## 已核实（非 UI 验收）

- `python tools/audit_dependencies.py` 对 94 个规范组件做**静态模式扫描**：观察到直接 import `react` 30、`framer-motion` 26、`lucide-react` 16、`three` 3。仅捕获脚本识别的字面 import/require，不等于完整运行依赖。
- 静态扫描观察到两个相对 import，均指向 `rewampui-components/shared/siteTheme.js`，在 `REGISTRY.json` 的 `resources` 声明。实测 full 模式针对 `day-night-sky-toggle` 和 `landscape-orb-toggle` 都返回该 helper 的源码；实际构建的 wheel 中也包含该文件（`python tools/audit_dependencies.py --wheel dist/holo_ui_mcp-0.0.1-py3-none-any.whl`）。未提供 wheel 时工具报告 `unverified`，不从 `force-include` 推断实际包含。
- `ld-wave` / `ld-ripple` 只有随包 CSS 的基础选择器 `.ld-wave-bar` / `.ld-ripple-ring` 才承担主要动画；额外修饰类没有独立规则不意味着需要 Tailwind。扫描整个 snippet 中的 `flex` 会误把内联样式当成工具类。
- ThemeToggle 的 `shared/base.css` 包含已编译的 Tailwind 形态规则，包括 `.dark\:toggles-dev--translate-y-\[50\%\]`。类名长得像工具类不等于宿主需要 Tailwind 编译器。其按钮内联 `onclick` 只切换自身 `.dark`，不提供页面级主题状态。
- BeautifulUI 的 snippet 有明确的 Tailwind utility 与 v4 依赖说明，而 `shared/base.css` 主要是 tokens/动画，且包含 Google Fonts `@import`。RewampUI 的组件同样使用 utility 类；这些是宿主样式前提的静态证据，而不是全库按类名前缀推导出的精确覆盖率。

## 尚未验证

遵照用户要求，**Agent 不进行 UI/浏览器验收**。用户已报告前端验收通过；ThemeToggle 的逐项明暗效果、全部 utility 覆盖及三卡片真实触控表现不在此静态审计的独立验证范围内。扫描不覆盖动态 `import()`、CSS `@import`/`url()`、HTML 资源属性或运行时拼接类名；“扫描到的本地 import 无缺失”不能写成“全部资产无缺失”。

## 直接 npm import 交付（已实施）与样式边界

构建脚本从 snippet 提取**受支持的静态 ES import**，生成按 canonical ID 索引的 `DEPENDENCIES.json`；`--check` 重建比对，不支持的 import/require/re-export 语法直接失败，不把未知语法误作零依赖。该视图与其他派生视图一起打入 wheel/sdist。源码是包导入的事实源；`REGISTRY.json` 仍是检索元数据和资源声明的唯一事实源。

启动时校验派生视图；MCP 的 summary/full 均可显示直接 npm import，而 `mode=summary` 只访问已加载的内存元数据，不按请求读取 snippet/CSS/helper。此字段不是 npm 安装命令，也不承诺完整运行依赖。宿主 CSS 前提不能从工具类形态可靠生成；此部分仍按经过验证的来源库约定及例外逐步核实，不能混进 npm import 清单。
