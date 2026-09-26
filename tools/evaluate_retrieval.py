"""Offline retrieval evaluation suite for Holo UI Vault.

Computes Hit@1, Hit@3, MRR@3, Set Recall@3, constraint violation rate,
no-match false positive rate, and p95 latency.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def compute_hit_at_k(retrieved: list[str], expected: list[str], k: int = 1) -> float:
    """Returns 1.0 if at least one expected ID is in retrieved[:k], else 0.0."""
    if not expected:
        return 0.0
    return 1.0 if any(cid in expected for cid in retrieved[:k]) else 0.0


def compute_set_overlap_recall_at_k(retrieved: list[str], expected: list[str], k: int = 3) -> float:
    """Returns fraction of expected IDs retrieved in top k: |retrieved[:k] & expected| / |expected|."""
    if not expected:
        return 0.0
    expected_set = set(expected)
    overlap = set(retrieved[:k]) & expected_set
    return len(overlap) / len(expected_set)


def compute_mrr_at_k(retrieved: list[str], expected: list[str], k: int = 3) -> float:
    """Returns Reciprocal Rank (1/rank) for the first hit within top k, or 0.0."""
    if not expected:
        return 0.0
    for rank, cid in enumerate(retrieved[:k], start=1):
        if cid in expected:
            return 1.0 / rank
    return 0.0


def check_component_violations(component: dict[str, Any], filters: dict[str, Any]) -> list[str]:
    """Returns list of violated filter keys for a returned component."""
    violations = []
    tokens = component.get("tokens", {})
    style = component.get("style")
    kind = component.get("kind", "component")

    for key, value in filters.items():
        if key == "style":
            if style != value:
                violations.append(f"style expected {value}, got {style}")
        elif kind == "design_system":
            # design system assets cannot satisfy component feature token dimensions
            violations.append(f"design_system asset returned for component filter {key}={value}")
        else:
            actual = tokens.get(key)
            if actual != value:
                violations.append(f"{key} expected {value}, got {actual}")
    return violations


def compute_p95(latencies: list[float]) -> float:
    """Returns the 95th percentile value from a list of latencies in ms."""
    if not latencies:
        return 0.0
    sorted_latencies = sorted(latencies)
    index = math.ceil(0.95 * len(sorted_latencies)) - 1
    return sorted_latencies[min(max(0, index), len(sorted_latencies) - 1)]


def evaluate_case(engine: Any, case: dict[str, Any], limit: int = 3) -> dict[str, Any]:
    query = case.get("query", "")
    filters = case.get("filters", {})
    expected_ids = case.get("expected_ids", [])
    expect_no_match = case.get("expect_no_match", False)
    component_id = case.get("component_id")
    case_slice = case.get("slice", "default")
    rationale = case.get("rationale", "")

    start = time.perf_counter()
    result = engine.search_and_retrieve(
        query=query,
        component_id=component_id,
        mode="summary",
        limit=limit,
        **filters,
    )
    elapsed_ms = (time.perf_counter() - start) * 1000.0

    retrieved_components = result.get("components", [])
    retrieved_ids = [c["id"] for c in retrieved_components]

    # Check constraint violations
    case_violations = []
    for c in retrieved_components:
        v = check_component_violations(c, filters)
        if v:
            case_violations.append({"id": c.get("id"), "violations": v})

    is_false_positive = expect_no_match and len(retrieved_ids) > 0
    hit_1 = compute_hit_at_k(retrieved_ids, expected_ids, k=1) if not expect_no_match else None
    hit_3 = compute_hit_at_k(retrieved_ids, expected_ids, k=limit) if not expect_no_match else None
    set_recall_3 = compute_set_overlap_recall_at_k(retrieved_ids, expected_ids, k=limit) if not expect_no_match else None
    mrr_3 = compute_mrr_at_k(retrieved_ids, expected_ids, k=limit) if not expect_no_match else None

    # Error attribution if failed
    attribution = None
    if expect_no_match and is_false_positive:
        attribution = "边界误报 (False Positive on No-Match)"
    elif not expect_no_match and (hit_3 == 0.0 or hit_1 == 0.0):
        if len(retrieved_ids) == 0:
            attribution = "零召回 (Zero Recall - Term Mismatch or Tokenization)"
        elif hit_1 == 0.0 and hit_3 == 1.0:
            attribution = "次优排序 (Suboptimal Ranking - Expected in Top 3 but not Top 1)"
        else:
            attribution = "语义漏召回 (Lexical Miss / Incomplete Metadata)"

    return {
        "query": query,
        "component_id": component_id,
        "filters": filters,
        "expected_ids": expected_ids,
        "expect_no_match": expect_no_match,
        "slice": case_slice,
        "rationale": rationale,
        "retrieved_ids": retrieved_ids,
        "retrieved_components": retrieved_components,
        "elapsed_ms": elapsed_ms,
        "violations": case_violations,
        "is_false_positive": is_false_positive,
        "hit_at_1": hit_1,
        "hit_3": hit_3,
        "set_recall_at_3": set_recall_3,
        "mrr_at_3": mrr_3,
        "attribution": attribution,
    }


def aggregate_metrics(results: list[dict[str, Any]]) -> dict[str, Any]:
    total_cases = len(results)
    matched_cases = [r for r in results if not r["expect_no_match"]]
    no_match_cases = [r for r in results if r["expect_no_match"]]

    # Positive ranking metrics
    avg_hit_1 = sum(r["hit_at_1"] for r in matched_cases) / len(matched_cases) if matched_cases else None
    avg_hit_3 = sum(r["hit_3"] for r in matched_cases) / len(matched_cases) if matched_cases else None
    avg_set_recall_3 = sum(r["set_recall_at_3"] for r in matched_cases) / len(matched_cases) if matched_cases else None
    avg_mrr_3 = sum(r["mrr_at_3"] for r in matched_cases) / len(matched_cases) if matched_cases else None

    # Constraint violation metrics:
    # 1. Item-level violation: violating items / total returned items
    total_returned_items = sum(len(r["retrieved_ids"]) for r in results)
    violating_items_count = sum(len(r["violations"]) for r in results)
    item_violation_rate = (
        violating_items_count / total_returned_items if total_returned_items > 0 else None
    )

    # 2. Request-level violation: requests with violations / requests that returned items
    requests_with_returns = [r for r in results if len(r["retrieved_ids"]) > 0]
    violating_requests_count = sum(1 for r in results if len(r["violations"]) > 0)
    request_violation_rate = (
        violating_requests_count / len(requests_with_returns) if requests_with_returns else None
    )

    # Negative false positive metric
    no_match_fp_count = sum(1 for r in no_match_cases if r["is_false_positive"])
    no_match_fp_rate = no_match_fp_count / len(no_match_cases) if no_match_cases else None

    latencies = [r["elapsed_ms"] for r in results]
    p95_lat = compute_p95(latencies)
    avg_lat = sum(latencies) / len(latencies) if latencies else 0.0

    return {
        "total_cases": total_cases,
        "matched_cases_count": len(matched_cases),
        "no_match_cases_count": len(no_match_cases),
        "hit_at_1": avg_hit_1,
        "hit_3": avg_hit_3,
        "set_recall_at_3": avg_set_recall_3,
        "mrr_at_3": avg_mrr_3,
        # Item violations
        "item_violation_rate": item_violation_rate,
        "violating_items_count": violating_items_count,
        "total_returned_items": total_returned_items,
        # Request violations
        "request_violation_rate": request_violation_rate,
        "violating_requests_count": violating_requests_count,
        "total_requests_with_returns": len(requests_with_returns),
        # False positives
        "no_match_false_positive_rate": no_match_fp_rate,
        "no_match_fp_count": no_match_fp_count,
        "avg_latency_ms": avg_lat,
        "p95_latency_ms": p95_lat,
    }


IMPLEMENTATION_FILES: tuple[str, ...] = (
    "holo_ui_mcp/__init__.py",
    "holo_ui_mcp/catalog.py",
    "holo_ui_mcp/engine.py",
    "holo_ui_mcp/retrieval.py",
    "holo_ui_mcp/server.py",
    "tools/__init__.py",
    "tools/build_index.py",
    "tools/evaluate_retrieval.py",
    "tools/migrate_helpers.py",
    "tools/validate_tokens.py",
)


def compute_implementation_fingerprint(
    root_dir: Path, files: tuple[str, ...] | list[str] = IMPLEMENTATION_FILES
) -> tuple[str, list[dict[str, str]]]:
    """Computes a stable SHA-256 fingerprint for implementation files.

    Sorted by relative path to guarantee order-independence.
    """
    import hashlib

    sorted_files = sorted(set(files))
    file_hashes: list[dict[str, str]] = []
    canonical_entries: list[str] = []

    for rel in sorted_files:
        p = root_dir / rel
        if p.is_file():
            h = hashlib.sha256(p.read_bytes()).hexdigest()
        else:
            h = "MISSING"
        clean_rel = rel.replace("\\", "/")
        file_hashes.append({"path": clean_rel, "sha256": h})
        canonical_entries.append(f"{clean_rel}:{h}")

    combined = "\n".join(canonical_entries).encode("utf-8")
    fingerprint = hashlib.sha256(combined).hexdigest()
    return fingerprint, file_hashes


def run_evaluation(fixtures_path: Path, root_dir: Path = ROOT, limit: int = 3) -> dict[str, Any]:
    from holo_ui_mcp.server import HoloUIEngine

    cases = json.loads(fixtures_path.read_text(encoding="utf-8"))
    engine = HoloUIEngine(str(root_dir))
    try:
        results = [evaluate_case(engine, case, limit=limit) for case in cases]
    finally:
        engine.close()

    overall = aggregate_metrics(results)

    # Partition: Dev Set (slice != 'holdout') vs Holdout (slice == 'holdout')
    dev_results = [r for r in results if r["slice"] != "holdout"]
    holdout_results = [r for r in results if r["slice"] == "holdout"]
    dev_metrics = aggregate_metrics(dev_results)
    holdout_metrics = aggregate_metrics(holdout_results)

    # Slice-level breakdown
    slices: dict[str, list[dict[str, Any]]] = {}
    for r in results:
        slices.setdefault(r["slice"], []).append(r)

    slice_metrics = {s: aggregate_metrics(cases_in_slice) for s, cases_in_slice in sorted(slices.items())}

    # Identify worst cases:
    # Worst cases: false positives, or positive cases with lowest MRR/Hit@3
    worst_candidates = []
    for r in results:
        penalty = 0.0
        if r["expect_no_match"]:
            if r["is_false_positive"]:
                penalty = 2.0  # false positive penalty
        else:
            penalty = 1.0 - (r["mrr_at_3"] if r["mrr_at_3"] is not None else 0.0)
        if penalty > 0:
            worst_candidates.append((penalty, r))

    worst_candidates.sort(key=lambda x: (x[0], x[1]["elapsed_ms"]), reverse=True)
    worst_10 = [item[1] for item in worst_candidates[:10]]

    import hashlib
    import subprocess
    from datetime import datetime, timezone

    fixtures_sha256 = hashlib.sha256(fixtures_path.read_bytes()).hexdigest()
    reg_path = root_dir / "REGISTRY.json"
    registry_sha256 = (
        hashlib.sha256(reg_path.read_bytes()).hexdigest() if reg_path.is_file() else "MISSING"
    )

    git_commit = "unknown"
    worktree_dirty = False
    try:
        git_commit = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=str(root_dir), text=True
        ).strip()
        status_out = subprocess.check_output(
            ["git", "status", "--porcelain"], cwd=str(root_dir), text=True
        ).strip()
        worktree_dirty = bool(status_out)
    except (subprocess.SubprocessError, OSError):
        pass

    fingerprint, file_hashes = compute_implementation_fingerprint(root_dir)

    metadata = {
        "git_commit": git_commit,
        "worktree_dirty": worktree_dirty,
        "fixtures_sha256": fixtures_sha256,
        "registry_sha256": registry_sha256,
        "implementation_fingerprint": fingerprint,
        "tracked_implementation_files": file_hashes,
        "run_timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "limit": limit,
        "fixtures_path": str(fixtures_path),
    }

    return {
        "metadata": metadata,
        "overall": overall,
        "dev_metrics": dev_metrics,
        "holdout_metrics": holdout_metrics,
        "slice_metrics": slice_metrics,
        "worst_10": worst_10,
        "results": results,
    }


def _fmt_pct(val: float | None, num: int | None = None, denom: int | None = None) -> str:
    if val is None:
        return "N/A"
    pct_str = f"{val * 100:.2f}%"
    if num is not None and denom is not None:
        return f"{num}/{denom} ({pct_str})"
    return pct_str


def _fmt_num(val: float | None, precision: int = 4) -> str:
    if val is None:
        return "N/A"
    return f"{val:.{precision}f}"


def format_report(eval_summary: dict[str, Any], limit: int = 3) -> str:
    metadata = eval_summary.get("metadata", {})
    overall = eval_summary["overall"]
    dev = eval_summary["dev_metrics"]
    holdout = eval_summary["holdout_metrics"]
    slice_metrics = eval_summary["slice_metrics"]
    worst_10 = eval_summary["worst_10"]

    total_count = overall["total_cases"]
    dev_count = dev["total_cases"]
    holdout_count = holdout["total_cases"]

    commit_str = metadata.get("git_commit", "N/A")
    if metadata.get("worktree_dirty"):
        commit_str += " (worktree dirty)"

    lines = [
        "# Holo UI 检索评测基准报告 (Offline Retrieval Evaluation)",
        f"- **评测总请求数**: {total_count} (开发集: {dev_count}, 原保留集: {holdout_count})",
        f"- **Git Commit (基线提交)**: `{commit_str}`",
        f"- **实现内容指纹 (工作区标识)**: `{metadata.get('implementation_fingerprint', 'N/A')}`",
        f"- **查询集 SHA256**: `{metadata.get('fixtures_sha256', 'N/A')}`",
        f"- **注册表 SHA256**: `{metadata.get('registry_sha256', 'N/A')}`",
        f"- **评测时间 (UTC)**: `{metadata.get('run_timestamp_utc', 'N/A')}`",
        f"- **检索上限 (limit)**: {limit}",
        "- **评测说明**: Git Commit 为基线提交，未提交工作区实现以 `implementation_fingerprint` 为准；评测模式 `mode='summary'` (纯元数据匹配，不计资源读取开销)。",
        "",
        "## 1. 核心分区口径指标 (Partition Overview)",
        f"| 指标 | 总体 (Overall, {total_count}条) | 开发集 (Dev, {dev_count}条) | 原保留集 (Holdout, {holdout_count}条) | 计算口径说明 |",
        "|:---|:---:|:---:|:---:|:---|",
        f"| **Hit@1** | {_fmt_pct(overall['hit_at_1'])} | {_fmt_pct(dev['hit_at_1'])} | {_fmt_pct(holdout['hit_at_1'])} | Top 1 命中任意可接受 ID 的正例比例 |",
        f"| **Hit@{limit}** | {_fmt_pct(overall['hit_3'])} | {_fmt_pct(dev['hit_3'])} | {_fmt_pct(holdout['hit_3'])} | Top {limit} 至少命中 1 个可接受 ID 的正例比例 |",
        f"| **MRR@{limit}** | {_fmt_num(overall['mrr_at_3'])} | {_fmt_num(dev['mrr_at_3'])} | {_fmt_num(holdout['mrr_at_3'])} | Top {limit} 首个命中结果的平均倒数排名 |",
        f"| **Set Recall@{limit}** | {_fmt_pct(overall['set_recall_at_3'])} | {_fmt_pct(dev['set_recall_at_3'])} | {_fmt_pct(holdout['set_recall_at_3'])} | Top {limit} 召回可接受集合元素的平均集合重合度 |",
        f"| **无结果误报率** | {_fmt_pct(overall['no_match_false_positive_rate'], overall['no_match_fp_count'], overall['no_match_cases_count'])} | {_fmt_pct(dev['no_match_false_positive_rate'], dev['no_match_fp_count'], dev['no_match_cases_count'])} | {_fmt_pct(holdout['no_match_false_positive_rate'], holdout['no_match_fp_count'], holdout['no_match_cases_count'])} | 预期空结果却返回非空的请求数 / 预期无结果请求总数 |",
        f"| **约束违规率(按项)** | {_fmt_pct(overall['item_violation_rate'], overall['violating_items_count'], overall['total_returned_items'])} | {_fmt_pct(dev['item_violation_rate'], dev['violating_items_count'], dev['total_returned_items'])} | {_fmt_pct(holdout['item_violation_rate'], holdout['violating_items_count'], holdout['total_returned_items'])} | 违规返回项数 / 返回组件总项数 |",
        f"| **约束违规率(按请求)** | {_fmt_pct(overall['request_violation_rate'], overall['violating_requests_count'], overall['total_requests_with_returns'])} | {_fmt_pct(dev['request_violation_rate'], dev['violating_requests_count'], dev['total_requests_with_returns'])} | {_fmt_pct(holdout['request_violation_rate'], holdout['violating_requests_count'], holdout['total_requests_with_returns'])} | 包含违规项的请求数 / 返回非空的请求数 |",
        f"| **p95 耗时** | {overall['p95_latency_ms']:.2f} ms | {dev['p95_latency_ms']:.2f} ms | {holdout['p95_latency_ms']:.2f} ms | 95 分位检索耗时 |",
        "",
        "## 2. 分组切片指标 (Slice Metrics)",
        "| 分组 (Slice) | 样本量 | 正例数 | 负例数 | Hit@1 | Hit@3 | MRR@3 | Set Recall@3 | 误报率 (分子/分母) | 违规项率 (分子/分母) | p95 耗时 |",
        "|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|",
    ]

    for s_name, sm in slice_metrics.items():
        hit1_str = _fmt_pct(sm["hit_at_1"])
        hit3_str = _fmt_pct(sm["hit_3"])
        mrr_str = _fmt_num(sm["mrr_at_3"])
        set_rec_str = _fmt_pct(sm["set_recall_at_3"])
        fp_str = _fmt_pct(sm["no_match_false_positive_rate"], sm["no_match_fp_count"], sm["no_match_cases_count"])
        violation_str = _fmt_pct(sm["item_violation_rate"], sm["violating_items_count"], sm["total_returned_items"])
        p95_str = f"{sm['p95_latency_ms']:.2f}ms"
        lines.append(
            f"| `{s_name}` | {sm['total_cases']} | {sm['matched_cases_count']} | {sm['no_match_cases_count']} | "
            f"{hit1_str} | {hit3_str} | {mrr_str} | {set_rec_str} | {fp_str} | {violation_str} | {p95_str} |"
        )

    lines.extend([
        "",
        "## 3. 最差查询列表 (Worst Cases & Attribution)",
    ])

    if not worst_10:
        lines.append("全部用例达到满分，无降级或错误用例！")
    else:
        for idx, w in enumerate(worst_10, start=1):
            q_display = w["query"] or f"(component_id={w['component_id']})"
            lines.append(f"### {idx}. [{w['slice']}] {q_display}")
            lines.append(f"- **Filters**: `{json.dumps(w['filters'], ensure_ascii=False)}`")
            lines.append(f"- **预期 IDs**: `{w['expected_ids']}` (expect_no_match={w['expect_no_match']})")
            lines.append(f"- **实际返回**: `{w['retrieved_ids']}`")
            lines.append(f"- **MRR@{limit}**: {_fmt_num(w['mrr_at_3'])}")
            lines.append(f"- **错误归因**: `{w['attribution']}`")
            lines.append(f"- **标注理由**: {w['rationale']}")
            lines.append("")

    return "\n".join(lines).rstrip("\n")


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--fixtures",
        type=Path,
        default=ROOT / "tests" / "fixtures" / "retrieval_cases.json",
        help="Path to retrieval cases JSON fixture",
    )
    parser.add_argument("--limit", type=int, default=3, help="Retrieval limit (default: 3)")
    parser.add_argument("--json", action="store_true", help="Output raw JSON summary to stdout")
    parser.add_argument(
        "--output-json",
        type=Path,
        default=ROOT / "docs" / "retrieval-benchmark-results.json",
        help="Path to save machine-readable results JSON",
    )
    parser.add_argument(
        "--output-report",
        type=Path,
        default=ROOT / "docs" / "retrieval-benchmark-report.md",
        help="Path to save generated markdown report",
    )
    args = parser.parse_args(argv)

    summary = run_evaluation(args.fixtures, root_dir=ROOT, limit=args.limit)
    report_text = format_report(summary, limit=args.limit)

    if args.output_json:
        args.output_json.parent.mkdir(parents=True, exist_ok=True)
        args.output_json.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if args.output_report:
        args.output_report.parent.mkdir(parents=True, exist_ok=True)
        args.output_report.write_text(report_text + "\n", encoding="utf-8")

    if args.json:
        out = {k: v for k, v in summary.items() if k != "results"}
        print(json.dumps(out, ensure_ascii=False, indent=2))
    else:
        print(report_text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
