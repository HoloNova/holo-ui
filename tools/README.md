# Holo UI Vault — Tools & Utilities

本目录包含 Holo UI Vault 核心工程工具与 AI Agent 协议服务器。

---

## 1. `mcp_server.py` — Holo UI Model Context Protocol (MCP) 服务器

专为 Cursor、Claude Desktop、Antigravity、Windsurf 等现代 AI 客户端打造的本地 Agent 协议服务。基于纯 Python 3 标准库构建（**0 外部依赖，无环境污染**）。

### 核心特性
- **单步直出（One-Shot Fulfillment）**：彻底消除“先搜索、再获取”的多次网络往返（Round-Trip），单次调用直接交付经过验证的 HTML/React 纯净原语与关联 CSS 变量。
- **Feature Tokens 赋能**：将 7 维度特征 Token（风格、功能分类、交互深度、动效、尺寸）作为 Schema 枚举内置，大模型在调用瞬间即可做高精度意图归类。
- **动态候选策略**：精准命中时仅输出 Top 1 最优解（极致节省 Token）；意图发散时并列输出评分最高的 Top 3 候选供大模型结合业务场景权衡。
- **框架转译指引**：在工具说明中注入框架无损转换指导，提示 AI 自动将 HTML/CSS 转译为 Vue 3 SFC、React JSX、Svelte 或 Tailwind 等目标栈。

### 本地直接测试
在命令行中可以直接运行内置的测试模式，无需启动 JSON-RPC：
```bash
# 测试语义检索（模糊搜索，返回 Top 3）
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

用于 CI/CD 和日常贡献检验，确保全库 80 个组件与 7 维度 Feature Token 规范保持 100% 严格对齐：
```bash
python tools/validate_tokens.py
```
