"""Unit tests verifying the correctness of offline evaluation formulas and metrics."""

import unittest
from pathlib import Path

from tools.evaluate_retrieval import (
    aggregate_metrics,
    check_component_violations,
    compute_hit_at_k,
    compute_implementation_fingerprint,
    compute_mrr_at_k,
    compute_p95,
    compute_set_overlap_recall_at_k,
    format_report,
    run_evaluation,
)

ROOT = Path(__file__).resolve().parents[1]


class EvaluationFormulaTests(unittest.TestCase):
    def test_compute_hit_at_k(self):
        # Empty expected
        self.assertEqual(compute_hit_at_k(["a", "b"], [], k=1), 0.0)

        # Hit at rank 1
        self.assertEqual(compute_hit_at_k(["ld-arc", "ld-ring"], ["ld-arc"], k=1), 1.0)
        self.assertEqual(compute_hit_at_k(["ld-arc", "ld-ring"], ["ld-ring", "ld-arc"], k=1), 1.0)

        # Hit at rank 2 (k=1 must be 0.0, k=2/3 must be 1.0)
        self.assertEqual(compute_hit_at_k(["other", "ld-arc"], ["ld-arc"], k=1), 0.0)
        self.assertEqual(compute_hit_at_k(["other", "ld-arc"], ["ld-arc"], k=2), 1.0)
        self.assertEqual(compute_hit_at_k(["other", "ld-arc"], ["ld-arc"], k=3), 1.0)

        # Outside rank
        self.assertEqual(compute_hit_at_k(["other1", "other2", "other3", "ld-arc"], ["ld-arc"], k=3), 0.0)

    def test_compute_set_overlap_recall_at_k(self):
        # Empty expected
        self.assertEqual(compute_set_overlap_recall_at_k(["a"], [], k=3), 0.0)

        # Partial overlap (1 of 2 expected)
        self.assertEqual(
            compute_set_overlap_recall_at_k(["ld-arc", "x", "y"], ["ld-arc", "ld-ring"], k=3), 0.5
        )

        # Full overlap (2 of 2 expected)
        self.assertEqual(
            compute_set_overlap_recall_at_k(["ld-arc", "ld-ring", "y"], ["ld-arc", "ld-ring"], k=3), 1.0
        )

        # Zero overlap
        self.assertEqual(
            compute_set_overlap_recall_at_k(["x", "y", "z"], ["ld-arc", "ld-ring"], k=3), 0.0
        )

    def test_compute_mrr_at_k(self):
        # Empty expected
        self.assertEqual(compute_mrr_at_k(["a"], [], k=3), 0.0)

        # Rank 1: 1 / 1 = 1.0
        self.assertEqual(compute_mrr_at_k(["a", "b", "c"], ["a"], k=3), 1.0)

        # Rank 2: 1 / 2 = 0.5
        self.assertEqual(compute_mrr_at_k(["x", "a", "c"], ["a"], k=3), 0.5)

        # Rank 3: 1 / 3
        self.assertAlmostEqual(compute_mrr_at_k(["x", "y", "a"], ["a"], k=3), 1.0 / 3)

        # Rank 4 with k=3: 0.0
        self.assertEqual(compute_mrr_at_k(["x", "y", "z", "a"], ["a"], k=3), 0.0)

        # Multiple expected: first match determines rank
        self.assertEqual(compute_mrr_at_k(["x", "b", "a"], ["a", "b"], k=3), 0.5)

    def test_check_component_violations(self):
        component = {
            "id": "shimmer-button",
            "style": "kinetic_motion_tactile",
            "tokens": {"motion": "transition", "scale": "compact", "runtime": "react-motion"},
            "kind": "component",
        }

        # Matching filters
        self.assertEqual(check_component_violations(component, {"motion": "transition", "scale": "compact"}), [])
        self.assertEqual(check_component_violations(component, {"style": "kinetic_motion_tactile"}), [])

        # Violated token
        v_token = check_component_violations(component, {"motion": "none"})
        self.assertEqual(len(v_token), 1)
        self.assertIn("motion expected none, got transition", v_token[0])

        # Violated style
        v_style = check_component_violations(component, {"style": "ai_native_productivity"})
        self.assertEqual(len(v_style), 1)
        self.assertIn("style expected ai_native_productivity", v_style[0])

        # Design system asset returned for component filter
        ds_comp = {
            "id": "apple-tokens",
            "style": "apple_human_interface",
            "kind": "design_system",
        }
        v_ds = check_component_violations(ds_comp, {"scale": "compact"})
        self.assertEqual(len(v_ds), 1)
        self.assertIn("design_system asset returned for component filter", v_ds[0])

    def test_compute_p95(self):
        self.assertEqual(compute_p95([]), 0.0)
        self.assertEqual(compute_p95([10.0]), 10.0)
        latencies = [float(i) for i in range(1, 101)]
        self.assertEqual(compute_p95(latencies), 95.0)

    def test_aggregate_metrics(self):
        results = [
            # Case 1: normal matched case, hit at rank 1, no violations
            {
                "expect_no_match": False,
                "hit_at_1": 1.0,
                "hit_3": 1.0,
                "set_recall_at_3": 1.0,
                "mrr_at_3": 1.0,
                "retrieved_ids": ["c1"],
                "violations": [],
                "is_false_positive": False,
                "elapsed_ms": 1.0,
            },
            # Case 2: normal matched case, hit at rank 2, 1 violation
            {
                "expect_no_match": False,
                "hit_at_1": 0.0,
                "hit_3": 1.0,
                "set_recall_at_3": 0.5,
                "mrr_at_3": 0.5,
                "retrieved_ids": ["c2", "c3"],
                "violations": [{"id": "c2", "violations": ["v1"]}],
                "is_false_positive": False,
                "elapsed_ms": 2.0,
            },
            # Case 3: expect_no_match case, returned 0 -> correct
            {
                "expect_no_match": True,
                "hit_at_1": None,
                "hit_3": None,
                "set_recall_at_3": None,
                "mrr_at_3": None,
                "retrieved_ids": [],
                "violations": [],
                "is_false_positive": False,
                "elapsed_ms": 0.5,
            },
            # Case 4: expect_no_match case, returned 1 -> false positive
            {
                "expect_no_match": True,
                "hit_at_1": None,
                "hit_3": None,
                "set_recall_at_3": None,
                "mrr_at_3": None,
                "retrieved_ids": ["unexpected"],
                "violations": [],
                "is_false_positive": True,
                "elapsed_ms": 0.5,
            },
        ]

        metrics = aggregate_metrics(results)
        self.assertEqual(metrics["total_cases"], 4)
        self.assertEqual(metrics["matched_cases_count"], 2)
        self.assertEqual(metrics["no_match_cases_count"], 2)

        # Hit@1: (1.0 + 0.0) / 2 = 0.5
        self.assertEqual(metrics["hit_at_1"], 0.5)

        # Hit@3: (1.0 + 1.0) / 2 = 1.0
        self.assertEqual(metrics["hit_3"], 1.0)

        # Set Recall@3: (1.0 + 0.5) / 2 = 0.75
        self.assertEqual(metrics["set_recall_at_3"], 0.75)

        # MRR@3: (1.0 + 0.5) / 2 = 0.75
        self.assertEqual(metrics["mrr_at_3"], 0.75)

        # Item violations: 1 violation among 4 total returned items -> 1/4 = 0.25
        self.assertEqual(metrics["item_violation_rate"], 0.25)
        self.assertEqual(metrics["violating_items_count"], 1)
        self.assertEqual(metrics["total_returned_items"], 4)

        # Request violations: Case 2 had violation out of 3 requests returning items (Case 1, 2, 4) -> 1/3
        self.assertAlmostEqual(metrics["request_violation_rate"], 1.0 / 3)
        self.assertEqual(metrics["violating_requests_count"], 1)
        self.assertEqual(metrics["total_requests_with_returns"], 3)

        # False positive: 1 false positive out of 2 no_match cases -> 1/2 = 0.5
        self.assertEqual(metrics["no_match_false_positive_rate"], 0.5)
        self.assertEqual(metrics["no_match_fp_count"], 1)

    def test_zero_denominator_returns_none(self):
        # Only negative cases: positive metrics should be None
        neg_results = [
            {
                "expect_no_match": True,
                "hit_at_1": None,
                "hit_3": None,
                "set_recall_at_3": None,
                "mrr_at_3": None,
                "retrieved_ids": [],
                "violations": [],
                "is_false_positive": False,
                "elapsed_ms": 0.5,
            }
        ]
        m = aggregate_metrics(neg_results)
        self.assertIsNone(m["hit_at_1"])
        self.assertIsNone(m["hit_3"])
        self.assertIsNone(m["mrr_at_3"])
        self.assertIsNone(m["set_recall_at_3"])
        self.assertIsNone(m["item_violation_rate"])
        self.assertIsNone(m["request_violation_rate"])
        self.assertEqual(m["no_match_false_positive_rate"], 0.0)

    def test_run_evaluation_and_format_report(self):
        import json
        import tempfile

        sample_cases = [
            {
                "query": "shimmer-button",
                "component_id": None,
                "filters": {},
                "expected_ids": ["shimmer-button"],
                "expect_no_match": False,
                "slice": "exact-id",
                "rationale": "Direct query",
            },
            {
                "query": "unknown crypto wallet",
                "component_id": None,
                "filters": {},
                "expected_ids": [],
                "expect_no_match": True,
                "slice": "unknown-asset",
                "rationale": "No match expected",
            },
        ]
        with tempfile.NamedTemporaryFile("w+", suffix=".json", delete=False, encoding="utf-8") as f:
            json.dump(sample_cases, f)
            tmp_path = Path(f.name)

        try:
            summary = run_evaluation(tmp_path, ROOT, limit=3)
            self.assertEqual(summary["overall"]["total_cases"], 2)
            report = format_report(summary, limit=3)
            self.assertIn("# Holo UI 检索评测基准报告", report)
            self.assertIn("exact-id", report)
            failed = {**summary, "worst_10": [{
                "query": "missing", "component_id": None, "slice": "unknown-asset",
                "filters": {}, "expected_ids": ["ld-wave"], "expect_no_match": False,
                "retrieved_ids": [], "mrr_at_3": 0.0, "attribution": "miss", "rationale": "test",
            }]}
            failed_report = format_report(failed, limit=3)
            self.assertFalse(failed_report.endswith("\n"))
        finally:
            if tmp_path.exists():
                tmp_path.unlink()

    def test_implementation_fingerprint_stability_and_sensitivity(self):
        import tempfile

        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            f1 = root / "file_a.py"
            f2 = root / "file_b.py"
            f1.write_text("print('hello')", encoding="utf-8")
            f2.write_text("print('world')", encoding="utf-8")

            # 1. Stability: file enumeration order does not affect fingerprint
            fp1, _ = compute_implementation_fingerprint(root, ["file_a.py", "file_b.py"])
            fp2, _ = compute_implementation_fingerprint(root, ["file_b.py", "file_a.py"])
            self.assertEqual(fp1, fp2)

            # 2. Sensitivity: changing content changes fingerprint
            f1.write_text("print('modified')", encoding="utf-8")
            fp3, _ = compute_implementation_fingerprint(root, ["file_a.py", "file_b.py"])
            self.assertNotEqual(fp1, fp3)


if __name__ == "__main__":
    unittest.main()
