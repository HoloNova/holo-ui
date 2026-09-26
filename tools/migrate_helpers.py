"""Deterministic helper resource migration for verified local helpers."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

VERIFIED_HELPERS = {
    "day-night-sky-toggle": {
        "expected_import": "siteTheme",
        "resource": {
            "path": "rewampui-components/shared/siteTheme.js",
            "kind": "javascript",
        },
    },
    "landscape-orb-toggle": {
        "expected_import": "siteTheme",
        "resource": {
            "path": "rewampui-components/shared/siteTheme.js",
            "kind": "javascript",
        },
    },
}


def migrate_helpers(root: Path = ROOT) -> int:
    registry_path = root / "REGISTRY.json"
    if not registry_path.is_file():
        raise FileNotFoundError(f"Missing {registry_path}")

    registry = json.loads(registry_path.read_text(encoding="utf-8"))
    components = registry.get("components", {})

    modified = False
    for cid, spec in VERIFIED_HELPERS.items():
        if cid not in components:
            raise ValueError(f"Target component {cid} not found in REGISTRY.json")

        comp = components[cid]
        snippet_rel = comp.get("snippet")
        if not snippet_rel:
            raise ValueError(f"Component {cid} has no snippet path")

        snippet_file = root / snippet_rel
        if not snippet_file.is_file():
            raise FileNotFoundError(f"Snippet file {snippet_file} not found")

        snippet_code = snippet_file.read_text(encoding="utf-8")
        if spec["expected_import"] not in snippet_code:
            raise ValueError(
                f"Snippet {snippet_rel} does not contain expected import '{spec['expected_import']}'"
            )

        res_path = root / spec["resource"]["path"]
        if not res_path.is_file():
            raise FileNotFoundError(f"Helper resource file {res_path} not found")

        current_resources = comp.get("resources", [])
        if not isinstance(current_resources, list):
            raise TypeError(f"Component {cid} resources must be a list")

        # Check if already present (idempotent / no duplicate insertion)
        already_has = any(
            r.get("path") == spec["resource"]["path"] and r.get("kind") == spec["resource"]["kind"]
            for r in current_resources
        )
        if not already_has:
            current_resources.append(spec["resource"])
            comp["resources"] = current_resources
            modified = True
            print(f"Added resource {spec['resource']['path']} to {cid}")
        else:
            print(f"Resource {spec['resource']['path']} already present in {cid}")

    if modified:
        registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Updated REGISTRY.json")
    else:
        print("REGISTRY.json already up-to-date")

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(migrate_helpers())
