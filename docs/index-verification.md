# 索引架构验证记录

## 范围与证据

对应计划：`index-architecture.md`。本轮不改组件 snippet、CSS、人工特征值或 DESIGN 内容，不发布 PyPI，不提交 Git。
没有可用的专用 planner/reviewer 子 Agent 调用工具；架构与安全边界由本会话检查，独立内容/检索质量审查交接给 `index-content-handoff.md`。

## TDD

1. 新增首批 13 个接口/stdio 回归测试，在旧引擎执行：失败（12 个 failure、5 个 error；含 subTest，数量不等于测试方法数）。失败覆盖旧路由、参数缺失、CSS 截断、别名元数据丢失。
2. 实现 catalog/retrieval/engine 和 MCP 适配后，相同 13 个测试全部通过。
3. 增加元数据迁移、输入验证、路径安全、全路由别名、七维枚举、stdio 错误、CLI 校验和扩库测试。
4. JSON 重复键测试先失败（原生 json.loads 接受重复键），增加严格加载后通过。
5. 最终 30 个测试通过。无跳过。未创建阶段提交；本记录保留 RED/GREEN 证据。

## 最终检查

| 检查 | 结果 |
|---|---|
| `python -m unittest discover -s tests` | 30 passed |
| coverage（含 stdio/CLI 子进程） | 总计 95%，含 branch；397 statements，160 branches |
| catalog / engine / retrieval 覆盖率 | 100% / 98% / 96% |
| `ruff check holo_ui_mcp tools/build_index.py tools/validate_tokens.py tests` | passed |
| `pyright`（pythonVersion=3.9） | 0 errors, 0 warnings |
| `python tools/build_index.py --check` | 94 canonical components，108 ID routes |
| `python tools/validate_tokens.py` | passed |
| `python -m build --no-isolation` | sdist + wheel 构建成功 |
| wheel 安装烟测 | 在临时隔离 venv 安装，仓库外 `python -I` 导入；94 组件、toggle-classic 别名、主题 CSS、可选 DESIGN 通过 |
| 与 HEAD 的 JSON 语义比较 | INDEX 完全相等；ROUTER 所有 ID/路径映射和关键词完全相等 |
| `git diff --check` | passed（仅 Windows 换行提示） |

开发工具通过 `uv run --no-project --with ...` 临时环境执行，未增加发布包运行依赖。
测试运行环境为 Windows / Python 3.14，SQLite 3.50.4 支持 FTS5；Python 3.9 为静态兼容检查，未做 3.9 运行验证。
AFT/LSP 缓存曾显示新模块导入未解析，CLI pyright 完整检查为 0 错误；以 CLI 结果为本次类型验证证据，不将缓存空结果当作通过。

## 安全与接口复核

- 用户文本不执行正则/SQL/FTS 运算；关键词为转义字面短语，FTS 参数绑定。
- 文件读取只来自注册表；绝对路径、越界、缺失路径均拒绝，resolve 后检查资源根目录。
- canonical ID、路由别名唯一；共享检索同义词保留歧义候选，不自动改 ID。
- 七维/style 硬约束在 ID 查询时同样生效，先筛选候选再截取 top-k。
- summary 不读代码/CSS/DESIGN 正文；full 共享资产按路径去重；输出不是置信概率。
- 不再存在按风格写死的 CSS 提取分支；合成测试证明仅增加元数据即可接入新风格。

## 未证明的事项

这不是 94 个组件的浏览器视觉/无障碍验证，也不是独立语义质量评测。
尚未验证完整 runtime/helper 依赖、DESIGN 数值准确性、中文任意改写召回、真实流量下的时延。
完整 CSS 交付可能增大上下文；未来需要构建期依赖拆包，而不是重新引入正则裁剪。
是否引入 embedding/向量库，应等待独立查询集评测，不能从本次回归通过推断。

## 局部 Helper 交付与评测校准验证记录

### 1. 范围与改动
- 在 `REGISTRY.json` 中为 `day-night-sky-toggle` 与 `landscape-orb-toggle` 声明了可选 `resources` 字段（引用 `rewampui-components/shared/siteTheme.js`，`kind: javascript`）。
- `Catalog._validate()` 新增 `resources` 结构、合法 kind、存在性、根路径越界与重复声明校验。
- `engine.search_and_retrieve()` 在 `mode='summary'` 下只返回引用字典不读取正文；在 `mode='full'` 下读取 helper 并置于顶层共享 `assets`（去重），并在 MCP 格式化文本中以 `javascript` 代码块及搬运提醒交付。
- 由 `tools/migrate_helpers.py` 幂等迁移并由 `python tools/build_index.py --write` 自动同步兼容视图。

### 2. 最新检查证据矩阵

| 检查项 | 状态 | 详细结果与指标 |
|---|:---:|---|
| `python -m unittest discover -s tests -v` | **PASSED** | 44 passed（0 skipped, 0 failed） |
| `coverage run -m unittest discover -s tests; coverage report` | **PASSED** | 总计 90%（724 statements，60 miss，290 branches）；catalog 100%, engine 98%, retrieval 96%, server 90% |
| `uvx ruff check holo_ui_mcp tools tests` | **PASSED** | All checks passed（0 errors） |
| `uvx pyright` | **PASSED** | 0 errors, 0 warnings, 0 informations |
| `python tools/build_index.py --check` | **PASSED** | Validated 94 canonical components and 108 ID routes |
| `python tools/validate_tokens.py` | **PASSED** | Validated 94 canonical components and 108 ID routes, 7D tokens 100% 合规 |
| `python -m build --no-isolation` | **PASSED** | sdist 与 wheel 构建成功 |
| 临时隔离 venv 下 Wheel 安装验证 | **PASSED** | 在仓库外隔离虚拟环境中安装并成功检索 `day-night-sky-toggle` 及其 helper 源码正文 |
| 评测基准运行与持久化 | **PASSED** | 同一次运行生成 `docs/retrieval-benchmark-results.json` 与 `docs/retrieval-benchmark-report.md` |
