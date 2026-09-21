# Apple Design Portal Update Detector

针对 [developer.apple.com/design](https://developer.apple.com/design/) 的自动化更新感知工具。

## 功能特性
1. **4 天智能缓存**：4 天内重复运行直接读本地缓存，不消耗外网带宽。
2. **WWDC / 新特性感知**：比对官网 HTML 指纹 Hash、WWDC 重点设计讲座列表、以及新增的设计工具（如 SF Symbols / Icon Composer 更新）。
3. **AI Agent 友好**：支持 `--json` 输出，提供标准 `use_local` 判定。

## 运行命令

```bash
# 默认模式（4天内直接读缓存）
python updater/check_updates.py

# 强制实时联网检查
python updater/check_updates.py --force

# JSON 模式（供 Agent 读取）
python updater/check_updates.py --force --json
```
