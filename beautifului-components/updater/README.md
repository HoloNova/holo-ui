# Beautiful UI Update Checker

检测 [beautifului.dev](https://www.beautifului.dev/) 是否有组件更新或新增。

## 文件说明

| 文件 | 说明 |
|------|------|
| `check_updates.py` | 主检测脚本 |
| `last_snapshot.json` | 上次抓取的网站指纹（CSS hash + 组件列表）|
| `update_log.json` | 检测历史记录，**Agent 读这个** |

## 使用方法

```bash
# 自动（4天内直接返回缓存结果，不联网）
python updater/check_updates.py

# 强制立即检查
python updater/check_updates.py --force

# 机器可读 JSON 输出（供 Agent 调用）
python updater/check_updates.py --json

# 检查 + 有更新时提示同步
python updater/check_updates.py --force --auto-sync
```

## AI Agent 使用方式

```
1. 运行: python updater/check_updates.py --json
2. 读取: updater/update_log.json
   - status == 'up-to-date'       → 本地库可用，直接用
   - status == 'update-available' → 告知用户有更新，建议运行同步
   - status == 'error'            → 无法联网，本地库照常使用
```

## update_log.json 结构

```json
{
  "last_checked": "2026-09-21T13:08:00+08:00",  // 上次检查时间
  "last_synced":  "2026-09-21T13:08:00+08:00",  // 上次完整同步时间  
  "status": "up-to-date",                       // 当前状态
  "use_local": true,                             // Agent 应读这个：true=放心用本地
  "days_since_check": 0,                         // 距上次检查天数
  "changes": [],                                 // 最新检测到的变化
  "history": []                                  // 历史记录（最近20条）
}
```

## 检测原理

1. **CSS 文件 hash**：Next.js 每次部署会更新 CSS 文件名中的 content hash，hash 变化 = 有代码更新
2. **组件列表**：解析导航栏中的 `<a href="#component-id">` 元素，检测新增/删除/重命名的组件

## 退出码

| 码 | 含义 |
|----|------|
| 0 | 无更新（up-to-date）|
| 1 | 有更新（update-available）|
| 2 | 检测出错（error）|

## 手动完整同步

目前需手动从 https://www.beautifului.dev/ 获取最新代码后重新整理本地库。
（未来可扩展 sync_components.py 实现自动同步）
