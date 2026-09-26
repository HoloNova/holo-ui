# Holo UI 检索评测基准报告 (Offline Retrieval Evaluation)
- **评测总请求数**: 120 (开发集: 100, 原保留集: 20)
- **Git Commit (基线提交)**: `b7fc2b6293e51f16c86baa9d2add8cb062c122d4 (worktree dirty)`
- **实现内容指纹 (工作区标识)**: `c98c9d541b89230717ff2e4b5e72e08958254f3e559f40d23b71e84c0c16be15`
- **查询集 SHA256**: `f4daeb78889c77cf02eb1d1a29c476551f6cb7ac94e3f5babc59b4900bb1c8dd`
- **注册表 SHA256**: `0f44d51a47d37171c0ed5809ee55aa4bc51542c4e60fc777980941571b737f6a`
- **评测时间 (UTC)**: `2026-09-26T02:13:49.148237+00:00`
- **检索上限 (limit)**: 3
- **评测说明**: Git Commit 为基线提交，未提交工作区实现以 `implementation_fingerprint` 为准；评测模式 `mode='summary'` (纯元数据匹配，不计资源读取开销)。

## 1. 核心分区口径指标 (Partition Overview)
| 指标 | 总体 (Overall, 120条) | 开发集 (Dev, 100条) | 原保留集 (Holdout, 20条) | 计算口径说明 |
|:---|:---:|:---:|:---:|:---|
| **Hit@1** | 53.92% | 63.41% | 15.00% | Top 1 命中任意可接受 ID 的正例比例 |
| **Hit@3** | 58.82% | 69.51% | 15.00% | Top 3 至少命中 1 个可接受 ID 的正例比例 |
| **MRR@3** | 0.5621 | 0.6626 | 0.1500 | Top 3 首个命中结果的平均倒数排名 |
| **Set Recall@3** | 50.33% | 59.55% | 12.50% | Top 3 召回可接受集合元素的平均集合重合度 |
| **无结果误报率** | 6/18 (33.33%) | 6/18 (33.33%) | N/A | 预期空结果却返回非空的请求数 / 预期无结果请求总数 |
| **约束违规率(按项)** | 0/175 (0.00%) | 0/166 (0.00%) | 0/9 (0.00%) | 违规返回项数 / 返回组件总项数 |
| **约束违规率(按请求)** | 0/77 (0.00%) | 0/74 (0.00%) | 0/3 (0.00%) | 包含违规项的请求数 / 返回非空的请求数 |
| **p95 耗时** | 0.73 ms | 0.75 ms | 0.60 ms | 95 分位检索耗时 |

## 2. 分组切片指标 (Slice Metrics)
| 分组 (Slice) | 样本量 | 正例数 | 负例数 | Hit@1 | Hit@3 | MRR@3 | Set Recall@3 | 误报率 (分子/分母) | 违规项率 (分子/分母) | p95 耗时 |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ambiguous` | 8 | 8 | 0 | 87.50% | 100.00% | 0.9375 | 58.33% | N/A | 0/24 (0.00%) | 0.77ms |
| `apple-design` | 5 | 3 | 2 | 100.00% | 100.00% | 1.0000 | 100.00% | 0/2 (0.00%) | 0/3 (0.00%) | 0.73ms |
| `en-constrained` | 10 | 10 | 0 | 80.00% | 90.00% | 0.8500 | 80.00% | N/A | 0/23 (0.00%) | 0.50ms |
| `en-natural` | 10 | 10 | 0 | 80.00% | 90.00% | 0.8500 | 85.00% | N/A | 0/30 (0.00%) | 0.77ms |
| `exact-id` | 8 | 8 | 0 | 100.00% | 100.00% | 1.0000 | 100.00% | N/A | 0/8 (0.00%) | 0.08ms |
| `hard-conflict` | 8 | 0 | 8 | N/A | N/A | N/A | N/A | 0/8 (0.00%) | N/A | 0.29ms |
| `holdout` | 20 | 20 | 0 | 15.00% | 15.00% | 0.1500 | 12.50% | N/A | 0/9 (0.00%) | 0.60ms |
| `nl-negative` | 6 | 6 | 0 | 16.67% | 33.33% | 0.2500 | 22.22% | N/A | 0/8 (0.00%) | 0.75ms |
| `route-alias` | 7 | 7 | 0 | 100.00% | 100.00% | 1.0000 | 100.00% | N/A | 0/7 (0.00%) | 0.55ms |
| `synonym-rewrite` | 10 | 10 | 0 | 60.00% | 60.00% | 0.6000 | 40.00% | N/A | 0/21 (0.00%) | 0.86ms |
| `unknown-asset` | 8 | 0 | 8 | N/A | N/A | N/A | N/A | 6/8 (75.00%) | 0/18 (0.00%) | 0.71ms |
| `zh-constrained` | 10 | 10 | 0 | 20.00% | 20.00% | 0.2000 | 20.00% | N/A | 0/9 (0.00%) | 4.94ms |
| `zh-natural` | 10 | 10 | 0 | 20.00% | 30.00% | 0.2333 | 23.33% | N/A | 0/15 (0.00%) | 0.42ms |

## 3. 最差查询列表 (Worst Cases & Attribution)
### 1. [unknown-asset] webrtc video streaming peer to peer conference grid
- **Filters**: `{}`
- **预期 IDs**: `[]` (expect_no_match=True)
- **实际返回**: `['streaming-text', 'loading-state', 'records-table']`
- **MRR@3**: N/A
- **错误归因**: `边界误报 (False Positive on No-Match)`
- **标注理由**: No video conferencing or WebRTC media streaming components in the vault.

### 2. [unknown-asset] wysiwyg rich text markdown block editor with table formatting
- **Filters**: `{}`
- **预期 IDs**: `[]` (expect_no_match=True)
- **实际返回**: `['streaming-text', 'code-block', 'diff-table']`
- **MRR@3**: N/A
- **错误归因**: `边界误报 (False Positive on No-Match)`
- **标注理由**: No full WYSIWYG rich text block editors.

### 3. [unknown-asset] leaflet map geospatial heatmap coordinates viewer
- **Filters**: `{}`
- **预期 IDs**: `[]` (expect_no_match=True)
- **实际返回**: `['code-block', 'diff-table', 'ld-compass']`
- **MRR@3**: N/A
- **错误归因**: `边界误报 (False Positive on No-Match)`
- **标注理由**: No GIS map or geographic coordinate components.

### 4. [unknown-asset] audio waveform music player equalizer visualizer
- **Filters**: `{}`
- **预期 IDs**: `[]` (expect_no_match=True)
- **实际返回**: `['ld-wave', 'flowchart', 'ld-ripple']`
- **MRR@3**: N/A
- **错误归因**: `边界误报 (False Positive on No-Match)`
- **标注理由**: No audio synthesizer or music player waveform components.

### 5. [unknown-asset] web3 metamask wallet connect modal dialog
- **Filters**: `{}`
- **预期 IDs**: `[]` (expect_no_match=True)
- **实际返回**: `['ld-ring', 'search', 'chat-composer']`
- **MRR@3**: N/A
- **错误归因**: `边界误报 (False Positive on No-Match)`
- **标注理由**: Holo UI does not have cryptocurrency Web3 wallet components.

### 6. [unknown-asset] pdf interactive annotation and signature canvas
- **Filters**: `{}`
- **预期 IDs**: `[]` (expect_no_match=True)
- **实际返回**: `['animated-search-demo', 'googly-eyes-button', 'theme-toggle-expand']`
- **MRR@3**: N/A
- **错误归因**: `边界误报 (False Positive on No-Match)`
- **标注理由**: No PDF rendering or digital signature components.

### 7. [zh-constrained] 按钮里显示保存中的小转圈，不要 React
- **Filters**: `{"runtime": "html-css", "scale": "micro", "category": "status"}`
- **预期 IDs**: `['ld-arc', 'ld-ring']` (expect_no_match=False)
- **实际返回**: `[]`
- **MRR@3**: 0.0000
- **错误归因**: `零召回 (Zero Recall - Term Mismatch or Tokenization)`
- **标注理由**: Pure CSS/SVG micro loaders suitable for inline button spin states without React.

### 8. [zh-constrained] 可折叠的AI思考推理过程卡片
- **Filters**: `{"scale": "standard", "category": "status", "lifecycle": "state-driven"}`
- **预期 IDs**: `['thinking-state']` (expect_no_match=False)
- **实际返回**: `['loading-state']`
- **MRR@3**: 0.0000
- **错误归因**: `语义漏召回 (Lexical Miss / Incomplete Metadata)`
- **标注理由**: thinking-state provides expandable accordion traces for step-by-step AI reasoning.

### 9. [synonym-rewrite] 滑动解锁式的高危操作拦截器
- **Filters**: `{}`
- **预期 IDs**: `['slide-to-confirm-button']` (expect_no_match=False)
- **实际返回**: `[]`
- **MRR@3**: 0.0000
- **错误归因**: `零召回 (Zero Recall - Term Mismatch or Tokenization)`
- **标注理由**: Synonym rewrite of slide to confirm button (滑动解锁, 高危拦截).

### 10. [en-natural] spinning rays theme toggle button
- **Filters**: `{}`
- **预期 IDs**: `['theme-toggle-spin']` (expect_no_match=False)
- **实际返回**: `['theme-toggle-around', 'theme-toggle-simple', 'theme-toggle-expand']`
- **MRR@3**: 0.0000
- **错误归因**: `语义漏召回 (Lexical Miss / Incomplete Metadata)`
- **标注理由**: Rapid rotating sun rays collapsing into crescent moon.
