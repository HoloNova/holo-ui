# 给内容与评测 Agent 的交接 Prompt

下面内容可直接交给另一位 Agent。架构核心已实现；不要重写检索算法来迎合个别用例。

---

你负责 Holo UI 的内容核对和独立评测，不负责架构重构。

## 先读

只读 `docs/index-architecture.md`、`REGISTRY.json` 和本任务明确需要核对的资产。
不要扫描所有展示页面，不要读取不相关组件实现。

## 不可改变的契约

- REGISTRY 是检索元数据唯一事实源，INDEX/ROUTER 是生成视图；执行 `python tools/build_index.py --write` 更新视图，不手改视图。
- canonical ID 不改名；route_aliases 是唯一的 ID 兼容别名。aliases 是检索同义词，允许多个组件共享（例如 dark-mode-toggle），不能强行归一成一个组件。
- 七维显式过滤为 AND 硬约束。未知 ID 和未知意图不得默认命中 thinking-state。
- DESIGN 是可选文档，不进入组件检索文本，不是新的元数据事实源。
- 不修改 `holo_ui_mcp/`、`tools/build_index.py` 和现有回归测试的预期结果；发现架构 bug 单独报告。

## 工作 A：内容审计

1. 路由别名已由脚本按相同源码路径生成，不要手工重做 94 个 ID 映射。抽查脚本结果和完整性，报告冲突。
2. 对新加主题切换库，核对标注 runtime、motion、interaction 是否与源码一致。视觉渲染与主题状态管理分开描述，不能把“CSS 动画”说成“不需要 JS 管理主题”。
3. 抽查跨库依赖：Tailwind 编译、CSS 工具类、局部 JS helper、Framer Motion、Three.js。完整 CSS 输出不等于源码可直接运行。报告缺失依赖，不虚构依赖信息。
4. 核对 DESIGN 的数值是否与实际 CSS 对齐；以源码为准。先提交差异报告，不批量改设计规则。
5. 库内 catalog/manifest、README 和 Feature Token 规范仍可能有旧表述。报告重复事实和失效承诺；不能将文案调整冒充检索能力提升。
6. 指出 style 实际混合了来源库、审美和用途的地方，提供分离 source/library 与 aesthetic 的建议；本轮不做分类体系大迁移。

## 工作 B：独立查询集

创建 `tests/fixtures/retrieval_cases.json`，至少 100 条：

```json
[
  {
    "query": "按钮里显示保存中的小转圈，不要 React",
    "filters": {"runtime": "html-css", "scale": "micro", "category": "status"},
    "expected_ids": ["ld-arc", "ld-ring"],
    "expect_no_match": false,
    "slice": "zh-constrained",
    "rationale": "从组件描述与实际代码独立标注，不抄当前搜索排名"
  }
]
```

覆盖：中英文、同义改写、纯 ID、路由别名、歧义、硬约束冲突、自然语言否定、未知资产、Apple 设计系统。
filters 代表调用 Agent 已提取的约束，不要求服务端理解自然语言否定。
expected_ids 是可接受集合，而不是唯一排名；expect_no_match=true 时 expected_ids 为空。
保留至少 20 条未用于调参的 holdout；不要根据引擎输出倒推真值。

写离线评测脚本，使用 HoloUIEngine(mode='summary', limit=3)，记录 Hit@1、Recall@3、MRR@3、约束违规率、无结果误报率、p95 耗时。
当前公共 limit 上限 3，不能把 Recall@3 写成 Recall@5；如要做未来 top-5 召回实验，单独标为内部评测。
评测不联网、不调用 embedding、不把没有候选的请求悄悄删除。
加入单元测试验证评测公式，不能只验证脚本能运行。

## 返回给主 Agent

- 改动文件列表与原因。
- `python tools/build_index.py --check`、`python tools/validate_tokens.py`、`python -m unittest discover -s tests -v` 的真实结果。
- 评测总体及分组指标、最差的 10 条查询、错误归因（内容/分词/排序/约束/资源）。
- 哪些问题需要主 Agent 调整架构，哪些只需要修标注。
- 尚未验证的内容。不要声称全部 UI 已验证可用。

禁止：部署、发布 PyPI、提交或推送 Git、改用户组件源码、凭空增加同义词以覆盖 holdout。
