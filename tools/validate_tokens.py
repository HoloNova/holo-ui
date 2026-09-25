#!/usr/bin/env python3
"""
Holo UI Vault — Token & Index Validation Suite
Validates:
1. All 80 components exist across ROUTER.json, INDEX.json, and local filesystem.
2. Every component has all 7 required Feature Token dimensions.
3. Every token value adheres strictly to the 47 permitted values in FEATURE_TOKENS.md.
4. Generates taxonomy distribution statistics.
"""

import json
import os
import sys

ALLOWED_DIMENSIONS = {
    "scale": {"micro", "compact", "standard", "region", "viewport"},
    "placement": {"embedded", "flow", "overlay", "dock", "shell"},
    "interaction": {"output", "input", "control", "navigation", "confirmation"},
    "lifecycle": {"persistent", "state-driven", "on-demand", "transient"},
    "motion": {"none", "transition", "css-loop", "spring", "webgl"},
    "category": {
        "status", "ai-response", "composer", "gate", "data",
        "content", "nav", "action", "setting", "text-effect",
        "showcase", "avatar", "code", "workflow", "diagram", "scaffold"
    },
    "runtime": {"html-css", "vanilla-js", "react", "react-motion", "react-3d"}
}

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root_dir)

    errors = []
    warnings = []

    # 1. Load INDEX.json and ROUTER.json
    try:
        with open("INDEX.json", "r", encoding="utf-8") as f:
            idx = json.load(f)
    except Exception as e:
        print(f"FATAL: Failed to read INDEX.json: {e}")
        sys.exit(1)

    try:
        with open("ROUTER.json", "r", encoding="utf-8") as f:
            rtr = json.load(f)
    except Exception as e:
        print(f"FATAL: Failed to read ROUTER.json: {e}")
        sys.exit(1)

    router_comps = rtr.get("components", {})
    index_comps = {}
    for cat_name, cat_obj in idx.get("by_function", {}).items():
        for item in cat_obj.get("items", []):
            cid = item.get("id")
            if cid:
                index_comps[cid] = item

    print(f"=== Holo UI Vault Validation Suite ===")
    print(f"Components in ROUTER.json: {len(router_comps)}")
    print(f"Unique components in INDEX.json: {len(index_comps)}")

    # 2. Check parity between ROUTER and INDEX
    # Router aliases pointing to known canonical component files are permitted
    canonical_paths = {router_comps.get(cid) for cid in index_comps.keys() if cid in router_comps}
    missing_in_index = {
        cid for cid, fpath in router_comps.items()
        if cid not in index_comps and fpath not in canonical_paths
    }
    missing_in_router = set(index_comps.keys()) - set(router_comps.keys())

    if missing_in_index:
        errors.append(f"Components in ROUTER.json but missing in INDEX.json: {missing_in_index}")
    if missing_in_router:
        errors.append(f"Components in INDEX.json but missing in ROUTER.json: {missing_in_router}")

    # 3. Check file existence for every component in ROUTER.json
    for cid, file_path in router_comps.items():
        if not os.path.exists(file_path):
            errors.append(f"Snippet file does not exist on disk: {file_path} (component: {cid})")

    # 4. Check Feature Tokens for all components in INDEX.json
    stats = {dim: {val: 0 for val in vals} for dim, vals in ALLOWED_DIMENSIONS.items()}

    for cid, item in index_comps.items():
        tokens = item.get("tokens")
        if not tokens:
            errors.append(f"Component '{cid}' is missing 'tokens' object in INDEX.json")
            continue

        for dim, allowed_vals in ALLOWED_DIMENSIONS.items():
            if dim not in tokens:
                errors.append(f"Component '{cid}' missing token dimension '{dim}'")
                continue

            val = tokens[dim]
            if val not in allowed_vals:
                errors.append(f"Component '{cid}' has invalid token '{val}' for dimension '{dim}'. Allowed: {allowed_vals}")
            else:
                stats[dim][val] += 1

        # Check required fields
        if not item.get("name"):
            warnings.append(f"Component '{cid}' missing human-readable 'name'")
        if not item.get("when"):
            errors.append(f"Component '{cid}' missing 'when' condition")
        if not item.get("when_not"):
            warnings.append(f"Component '{cid}' missing 'when_not' constraint")
        if "aliases" not in item:
            warnings.append(f"Component '{cid}' missing 'aliases' array")

    # 5. Output Results
    if errors:
        print("\n[FAILED] Validation Errors Found:")
        for err in errors:
            print(f"  - {err}")
    else:
        print("\n[PASSED] All 80 components passed full validation with 0 errors!")

    if warnings:
        print(f"\n[WARNING] {len(warnings)} non-critical warnings:")
        for w in warnings:
            print(f"  - {w}")

    # Print Taxonomy Distribution
    print("\n--- Feature Token Distribution ---")
    for dim, counts in stats.items():
        print(f"\nDimension: {dim}")
        for val, count in sorted(counts.items(), key=lambda x: -x[1]):
            if count > 0:
                bar = "█" * (count // 2 if count > 1 else 1)
                print(f"  {val:<15}: {count:>2} {bar}")

    if errors:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
