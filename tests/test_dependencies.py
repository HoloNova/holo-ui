"""Build-time direct-import dependency view and MCP metadata contract."""

import json
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from holo_ui_mcp.catalog import Catalog
from holo_ui_mcp.engine import HoloUIEngine, format_tool_response
from tools.build_index import direct_imports, render_dependency_view

ROOT = Path(__file__).resolve().parents[1]
DOCUMENT = json.loads((ROOT / "REGISTRY.json").read_text(encoding="utf-8"))


class DependencyViewTests(unittest.TestCase):
    def test_direct_imports_are_limited_to_supported_static_syntax(self):
        source = 'import React from "react";\nimport { motion } from "framer-motion";\nimport "./local.css";\n'
        self.assertEqual(direct_imports(source), ("framer-motion", "react"))
        for unsupported in ('const x = import("three");', 'const x = require("three");',
                            'import { x } from variable;', 'import {\n  x\n} from "three";',
                            '<script type="module">import "three";</script>'):
            with self.subTest(source=unsupported), self.assertRaises(ValueError):
                direct_imports(unsupported)

    def test_view_is_derived_from_real_snippets_and_changes_when_imports_change(self):
        view = render_dependency_view(DOCUMENT, ROOT)
        self.assertEqual(view["schema_version"], 1)
        self.assertEqual(set(view["components"]), set(DOCUMENT["components"]))
        self.assertEqual(view["components"]["fluid-morph-orb"], ["react", "three"])
        self.assertEqual(view["components"]["ld-wave"], [])
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "sample.jsx").write_text('import React from "react";\n', encoding="utf-8")
            doc = {"components": {"sample": {"snippet": "sample.jsx"}}}
            before = render_dependency_view(doc, root)
            (root / "sample.jsx").write_text('import React from "react";\nimport "three";\n', encoding="utf-8")
            self.assertNotEqual(before, render_dependency_view(doc, root))

    def test_catalog_rejects_incomplete_or_invalid_dependency_view(self):
        valid = json.loads((ROOT / "DEPENDENCIES.json").read_text(encoding="utf-8"))
        self.assertEqual(Catalog(ROOT).npm_dependencies["ld-wave"], ())
        missing = {**valid, "components": {k: v for k, v in valid["components"].items() if k != "ld-wave"}}
        with self.assertRaises(ValueError):
            Catalog(ROOT, DOCUMENT, dependency_document=missing)
        bad = {**valid, "components": {**valid["components"], "ld-wave": ["react", "react"]}}
        with self.assertRaises(ValueError):
            Catalog(ROOT, DOCUMENT, dependency_document=bad)

    def test_summary_exposes_direct_imports_without_reading_snippet(self):
        engine = HoloUIEngine(ROOT)
        self.addCleanup(engine.close)
        from unittest.mock import patch
        with patch.object(engine.catalog, "read_asset", side_effect=AssertionError("must not read source")):
            result = engine.search_and_retrieve("", component_id="fluid-morph-orb", mode="summary")
            self.assertEqual(result["components"][0]["npm_dependencies"], ["react", "three"])
            self.assertIn("Direct npm imports: `react`, `three`", format_tool_response(result))
        pure = engine.search_and_retrieve("", component_id="ld-wave", mode="summary")
        self.assertEqual(pure["components"][0]["npm_dependencies"], [])
        self.assertIn("No direct npm imports detected", format_tool_response(pure))


if __name__ == "__main__":
    unittest.main()
