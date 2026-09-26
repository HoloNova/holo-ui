# 检索质量诊断（仅开发集，不改排序）

基于 `tests/fixtures/retrieval_cases.json` 中已公开的 100 条开发集和 `docs/retrieval-benchmark-results.json` 的存档结果；20 条原 holdout 已公开，本次**不用于调参**。数据为当时工作区实现的结果，并非当前提交的重新评测；最近的依赖视图提交不改变检索规则或 REGISTRY 内容。

- 开发集正例 82 条，Hit@1 52/82、Hit@3 57/82；预期无结果 18 条，其中 6 条误报。
- 25 条 Hit@3 漏召回里，21 条预期 ID 满足自身硬过滤条件，但查询词与预期组件现有索引字段（ID、name、aliases、route_aliases、when）**没有词项交集**。分布：zh-constrained 7、zh-natural 6、synonym-rewrite 4、nl-negative 3、en-constrained 1。其余 4 条有词项交集但未进 Top 3。
- 这不是增加 BM25 权重可以解决的召回：候选连词法匹配门槛都进不来。应先依据组件源码/行为补充经过审查的双语检索表达，再用**独立于已公开 120 条的查询**判断泛化效果；不要从失败例句直接抄别名。硬约束和精确 ID 契约保持不变。
- 非落盘对照：把 SQLite FTS5 tokenizer 改为 `porter unicode61` 后，开发集 Hit@1 由 52→53、Hit@3 由 57→58、误报仍为 6/18，但 `card` 的 Top 1 从可接受的 `recommendation-card` 降为非预期结果。收益有限且有回归，**不采用**。词干化也不能弥补中文/英文之间的零词项交集。

下一步先确定组件级双语检索字段的来源与审查方式，做少量**基于真实组件语义**的内容试点；与现有 120 条解耦建立新的盲测，才考虑是否需要语义检索。此诊断不修改查询集、REGISTRY 或生产检索代码。
