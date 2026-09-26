# Holo UI Vault — Tools & Utilities

本目录包含 Holo UI Vault 核心工程工具与 AI Agent 协议服务器。

---

## 1. `mcp_server.py` — Holo UI Model Context Protocol (MCP) 服务器

专为 Cursor、Claude Desktop、Antigravity、Windsurf 等现代 AI 客户端打造的本地 Agent 协议服务。基于纯 Python 3 标准库构建（**0 外部依赖，无环境污染**）。

### 核心特性
- **单一事实源**：检索元数据读取 `REGISTRY.json`；兼容的 INDEX/ROUTER 与从 snippet 提取直接 npm import 的 `DEPENDENCIES.json` 由脚本生成。
- **约束检索**：style 与完整七维参数为 AND 硬约束，枚举自动生成；ID/路由别名优先，SQLite FTS5/BM25 负责词法排序。Python 的 sqlite3 必须支持 FTS5。
- **按需展开**：默认 `mode=full, limit=1` 返回源码与完整共享 CSS；`mode=summary, limit=3` 只返回候选元数据。公共 limit 为 1..3。
- **明确边界**：无匹配返回空，不默认回退；自然语言否定需调用 Agent 转换为过滤参数。DESIGN 仅通过 `include_design=true` 按需附加。
- **资源完整性**：不再用正则裁剪 CSS；相同资源在响应中只输出一次。summary/full 显示的直接 npm import 不等于所有运行依赖或 Tailwind 宿主配置；完整共享 CSS 可能较大。

### 本地直接测试
在命令行中可以直接运行内置的测试模式，无需启动 JSON-RPC：
```bash
# 词法检索（默认返回 Top 1）
python tools/mcp_server.py --test "table diff"

# 测试精准命中（返回 Top 1）
python tools/mcp_server.py --test "thinking-state"
```

### AI 客户端接入配置

#### A. 在 Cursor 中接入
打开 `Settings -> Features -> MCP -> Add New MCP Server`:
- **Name**: `holo-ui`
- **Type**: `command`
- **Command**: `python <你的绝对路径>/holo-ui/tools/mcp_server.py`

#### B. 在 Claude Desktop 中接入
编辑 `%APPDATA%\Claude\claude_desktop_config.json`（Windows）或 `~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）：
```json
{
  "mcpServers": {
    "holo-ui": {
      "command": "python",
      "args": ["<你的绝对路径>/holo-ui/tools/mcp_server.py"]
    }
  }
}
```

---

## 2. `validate_tokens.py` — 索引与 Token 规范校验器

校验 canonical ID、路径、七维枚举、别名唯一性和生成视图一致性（不代替视觉或检索质量评测）：
```bash
python tools/validate_tokens.py
```

## 3. 注册表维护与回归验证

新检索架构已入库，尚未发布到 PyPI。

```bash
# 修改元数据或 snippet 后重建 INDEX / ROUTER / DEPENDENCIES 派生视图
python tools/build_index.py --write
python tools/build_index.py --check
python -m unittest discover -s tests -v

# 可选开发检查；不增加发布包的运行依赖
uv run --no-project --with coverage coverage run -m unittest discover -s tests
uv run --no-project --with coverage coverage combine
uv run --no-project --with coverage coverage report
uv run --no-project --with pyright pyright
uv run --no-project --with ruff ruff check holo_ui_mcp tools/build_index.py tools/validate_tokens.py tests
```

`--migrate` 只用于没有 REGISTRY.json 的旧仓库；已完成迁移的仓库会拒绝覆盖。
架构与边界见 [索引架构](../docs/index-architecture.md)，独立内容/查询评测任务见 [Agent 交接](../docs/index-content-handoff.md)。
