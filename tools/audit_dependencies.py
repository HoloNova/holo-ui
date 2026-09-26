"""Bounded static audit of snippet imports and styling clues.

This is not an AST parser or a proof of host styling/runtime requirements.
"""

import argparse
import json
import re
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
STATIC_IMPORT = re.compile(
    r'''\bimport\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"]([^'"]+)['"]|\brequire\(['"]([^'"]+)['"]\)'''
)
STATIC_CLASS = re.compile(r'''\b(?:class|className)\s*=\s*['"]([^'"]+)['"]''')
UTILITY_SHAPE = re.compile(
    r"^(?:sm:|md:|lg:|dark:|hover:|focus:|motion-safe:|"
    r"flex$|grid$|inline-flex$|hidden$|relative$|absolute$|"
    r"(?:items|justify|gap|w|h|p|px|py|m|mx|my|bg|text|rounded|border|shadow|opacity)-)"
)
RESOLVE_EXTENSIONS = (".js", ".jsx", ".ts", ".tsx", ".css", ".json")


def class_tokens(source):
    """Extract only literal class/className attributes, never arbitrary source text."""
    return {token for attribute in STATIC_CLASS.findall(source) for token in attribute.split()}


def _resolve_import(snippet_path, specifier):
    path = (snippet_path.parent / specifier).resolve()
    if path.is_file():
        return path
    return next((Path(str(path) + ext) for ext in RESOLVE_EXTENSIONS
                 if Path(str(path) + ext).is_file()), path)


def audit(wheel_path=None):
    registry = json.loads((ROOT / "REGISTRY.json").read_text(encoding="utf-8"))
    wheel_members = None
    if wheel_path is not None:
        with ZipFile(wheel_path) as wheel:
            wheel_members = set(wheel.namelist())

    packages = {}
    local_imports = []
    styles = {name: {"bundled_css": [data[key] for key in ("tokens_css", "shared_style")
                                   if data.get(key)], "utility_shaped_count": 0}
              for name, data in registry["styles"].items()}
    style_tokens = {name: set() for name in styles}
    missing_snippets = []
    for cid, comp in registry["components"].items():
        snippet = ROOT / comp["snippet"]
        if not snippet.is_file():
            missing_snippets.append(cid)
            continue
        source = snippet.read_text(encoding="utf-8")
        style_tokens[comp["style"]].update(token for token in class_tokens(source)
                                           if UTILITY_SHAPE.match(token))
        for match in STATIC_IMPORT.finditer(source):
            specifier = match.group(1) or match.group(2)
            if not specifier.startswith("."):
                package = "/".join(specifier.split("/")[:2]) if specifier.startswith("@") else specifier.split("/")[0]
                packages.setdefault(package, set()).add(cid)
                continue
            resolved = _resolve_import(snippet, specifier)
            try:
                relative = resolved.relative_to(ROOT).as_posix()
            except ValueError:
                relative = str(resolved)
            local_imports.append({
                "component_id": cid, "specifier": specifier, "path": relative,
                "exists_in_repo": resolved.is_file(),
                "declared_in_resources": relative in {r["path"] for r in comp.get("resources", [])},
                "in_wheel": None if wheel_members is None else "holo_ui_mcp/" + relative in wheel_members,
            })

    for name, tokens in style_tokens.items():
        styles[name]["utility_shaped_count"] = len(tokens)
    return {"total_components": len(registry["components"]), "packages": packages,
            "local_imports": local_imports, "missing_snippets": missing_snippets, "styles": styles}


def format_report(result):
    lines = [f"Audited {result['total_components']} components (static pattern scan, not AST).",
             "Direct npm imports observed: " + ", ".join(
                 f"{package} ({len(ids)})" for package, ids in sorted(result["packages"].items())),
             "Styles: utility-shaped classes do not establish a host CSS compiler requirement:"]
    for name, info in sorted(result["styles"].items()):
        lines.append(f"  {name}: {info['utility_shaped_count']} unique utility-shaped tokens; "
                     f"bundled CSS: {', '.join(info['bundled_css']) or 'none'}")
    lines.append(f"Missing snippet files: {result['missing_snippets']}")
    lines.append("Observed relative imports (declaration is not proof of MCP delivery):")
    for ref in result["local_imports"]:
        wheel = "unverified" if ref["in_wheel"] is None else str(ref["in_wheel"])
        lines.append(f"  {ref['component_id']}: {ref['specifier']} -> {ref['path']}; "
                     f"repo={ref['exists_in_repo']}, resources={ref['declared_in_resources']}, wheel={wheel}")
    lines.append("Not scanned: dynamic import, CSS @import/url(), HTML resource attributes, "
                 "computed classes, build-time transforms; verify actual MCP and browser delivery separately.")
    return "\n".join(lines)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--wheel", type=Path, help="inspect actual wheel members (otherwise unverified)")
    print(format_report(audit(wheel_path=parser.parse_args().wheel)))
