# 索引架构与实施计划

## PRD：目标与范围

Holo UI 的核心是可定位、可约束、可交付的 UI 资产索引，不是设计描述生成器。
本轮保留组件 ID、源码、人工特征标注和 MCP 工具名，不引入网络检索、embedding 或外部数据库。
成功条件：别名与 canonical ID 等价；七维和 style 显式条件不被放宽；未知请求不伪造命中；资源完整；添加风格无需改 Python 分支。

## 架构决策

- `REGISTRY.json` 是检索元数据唯一事实源。每个组件只存一次；功能分组只引用 ID。
- `INDEX.json` 与 `ROUTER.json` 是生成的兼容视图，供文件读取型 Agent 使用。库内 catalog/manifest 暂作展示资料，不参与 MCP 检索；其人工内容核对独立交接。
- `tools/build_index.py --migrate` 一次性读取旧 INDEX/ROUTER，按相同源码路径推导路由别名。冲突或未知路径必须失败，不推测新 ID。
- `--write` 从 REGISTRY 重建兼容视图；`--check` 检查视图漂移及注册表有效性。
- Python SQLite FTS5 在内存建索引；复用其 BM25，不自己实现搜索算法，不添加第三方运行依赖。需要 Python 的 sqlite3 带 FTS5；不支持时明确失败。
- 七维枚举与 style 枚举直接来自注册表，同时用于参数验证和 MCP schema。
- `DESIGN.md` 是可选附加资料，不进全文索引，不参与匹配评分，不默认加载。

## 系统设计

```text
REGISTRY ──构建脚本──> INDEX / ROUTER（兼容视图）
    └── Catalog ──> Retrieval（约束 + exact/alias + FTS5）
                         └── Engine（summary 或资源展开）──> MCP 格式化
```

### 数据契约

`components` 为 ID -> 元数据，保留 name/style/tokens/when/when_not/aliases，新增 snippet 与 route_aliases。
`styles` 复用原 by_style 的 shared_style/tokens_css/design_md/prompt_preset 路径。
`functions` 保留分组说明，但 items 改为 ID 数组。
`keywords` 是旧路由词表，`|` 仅为字面短语分隔符，不执行正则。
`index_metadata`/`router_metadata` 是兼容视图模板，不是第二份组件数据；七维 schema 位于 index_metadata.feature_tokens_schema。

### 查询契约

保留 `get_holo_ui_component`，保留原参数，增加 placement/lifecycle/runtime、mode、limit、include_design。

- 所有显式 style/七维参数为等值 AND 硬约束，包括精确 ID 检索。未知枚举报错，冲突返回空。
- component_id 是 ID/别名查询；未知 ID 返回空，不转自然语言检索。
- 自然语言先尝试完整 ID/别名，然后 FTS5。关键词使用字面、英语词边界、中文子串匹配；较长短语优先，只用于候选偏好，不能突破约束。
- 不分析自然语言中的否定/依赖限制；调用 Agent 应转换为结构化参数，服务端不再调用另一个 LLM。
- 默认 mode=full、limit=1，保持单步交付；mode=summary 返回候选元数据，不读取代码/CSS/DESIGN；limit 范围 1..3。
- 排序有稳定 ID tie-break，返回匹配原因；分数不是概率。
- 空请求、无匹配、约束冲突明确返回 count=0，无默认 thinking-state。
- 无组件的风格（如 Apple）作为 design_system 资产返回，不能满足组件七维条件。
- full 返回完整共享 CSS，而不是正则裁剪嵌套规则；格式化响应按路径去重。资源大小优化留给后续经验证的构建期拆包。
- include_design 只在 full 模式生效，资料独立附加，不替换组件源码。

### 安全与失败语义

仅允许注册表内路径，解析后必须位于资源根目录内，防止绝对路径/越界/符号链接逃逸。
启动校验 JSON 重复键、路由 ID/别名冲突、分组引用、枚举、路径及文件存在性；错误不降级为空索引。描述性 aliases 允许共享，只有 route_aliases 承诺唯一身份。
MATCH 参数由分词后加引号的字面词构成，并使用 SQL 参数绑定；用户不能提交 SQL 或 FTS 运算表达式。
运行期间按已声明路径读取；损坏文件显式报错。MCP 客户端不回传内部栈或绝对路径。

## 技术选型比较

| 方案 | 结论 |
|---|---|
| 继续手写加减分 | 容易被词表顺序和任意阈值支配，替换为 FTS5 |
| 单纯 BM25 | 无法保证技术栈/尺寸等约束，必须先分面约束 |
| FTS5 + 分面 + ID | 当前选择；标准算法、离线、便于回归 |
| embedding 本地相似度 | 真实跨语言/改写漏召回足够多时做离线实验 |
| 向量数据库 | 需要持久增量更新、并发、服务化、过滤/版本管理时再采用 |
| 依赖图/图数据库 | 目前显式资产路径已足够，不引入图数据库 |

参考：https://www.sqlite.org/fts5.html （bm25 列权重、MATCH 字面串）。
调研了 rank-bm25 包；当前无需为同类算法增加依赖。环境没有 gh CLI，GitHub CLI 搜索未能执行。

## 何时增加向量检索

先制作独立标注的真实查询集（建议至少 100 条，覆盖中文/英文/模糊描述/技术约束/无结果）。
当前公共 limit 上限为 3，先记录 Recall@3、MRR@3、约束违规率、无结果误报率、p95 时延和响应字节数。未来内部召回实验再比较 Recall@5。
当漏召回主要来自同义改写/跨语言，而非元数据缺失或路由 bug，再对比多语言 embedding。
建议实验门槛（不是已达到的指标）：混合检索 Recall@5 比词法基线提升至少 5 个百分点，约束违规为 0，时延和成本可接受。
先本地向量文件 + 精确余弦检索即可验证收益；embedding 不等于向量数据库。
若有效，再采用 lexical/vector 双路召回 + RRF 融合，但 hard filters 和 canonical ID 层保持不变。
外部向量库的触发因素是持续增量、并发服务、容量/延迟的实测需求，不是达到某个神奇组件数。

## 任务与验证

1. 先写引擎回归与 stdio 测试，验证旧实现失败。
2. 脚本迁移注册表、生成视图；重复执行和 --check 验证确定性。
3. 分离 catalog / retrieval / engine，保留 MCP 适配层。
4. 验证空请求、未知 ID、全部路由别名、七维约束、短语优先、中文边界、资源完整/去重、路径安全。
5. 构建 wheel，确认主题切换资源、注册表及所有新 Python 模块均打包。
6. 人工内容标注、独立质量评测交给另一个 Agent；见 `index-content-handoff.md`。

## 已知边界

全文检索不能理解任意语义；中文短语路由修复不等于完整跨语言搜索。
当前 taxonomy 的 runtime 最高依赖档位不等于完整 dependencies；多依赖清单与 UI 状态覆盖需后续标注。style 也混合了来源库、审美与用途，未来可在有标注证据后分离 library/source 与 aesthetic，不能机械改名解决。
完整共享 CSS 保证不因提取而截断，但可能较大；summary 与默认单结果先控制开销。
不声称已验证每个 snippet 的视觉、无障碍、可移植性或 DESIGN 数值正确性。
