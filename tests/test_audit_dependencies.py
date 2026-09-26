"""Regression tests for the bounds of the static dependency audit."""

import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

from tools.audit_dependencies import audit, class_tokens, format_report


class DependencyAuditTests(unittest.TestCase):
    def test_loader_modifiers_are_not_required_to_have_separate_css_rules(self):
        root = Path(__file__).resolve().parents[1]
        css = (root / "loadingdev-components/shared/base.css").read_text(encoding="utf-8")
        for name, base in (("ld-wave", "ld-wave-bar"), ("ld-ripple", "ld-ripple-ring")):
            snippet = (root / f"loadingdev-components/components/wave-pulse/{name}.snippet.html").read_text(
                encoding="utf-8"
            )
            self.assertIn(base, class_tokens(snippet))
            self.assertIn(f".{base} {{", css)

    def test_ld_wave_inline_style_does_not_become_a_utility_class(self):
        source = '<div class="ld-wave-bar ld-wave-bar-center" style="display: flex" aria-hidden="true">'
        self.assertEqual(class_tokens(source), {"ld-wave-bar", "ld-wave-bar-center"})

    def test_precompiled_toggle_classes_are_not_host_tailwind_requirements(self):
        result = audit()
        toggle = result["styles"]["minimal_theme_toggles"]
        self.assertIn("themetoggle-components/shared/base.css", toggle["bundled_css"])
        self.assertGreater(toggle["utility_shaped_count"], 0)
        root = Path(__file__).resolve().parents[1]
        css = (root / "themetoggle-components/shared/base.css").read_text(encoding="utf-8")
        self.assertIn(r".dark\:toggles-dev--translate-y-\[50\%\]", css)
        self.assertNotIn("requires_host_tailwind", toggle)
        self.assertNotIn("requires host Tailwind", format_report(result))

    def test_wheel_presence_requires_an_actual_archive(self):
        unverified = audit()["local_imports"]
        self.assertEqual(len(unverified), 2)
        self.assertTrue(all(ref["in_wheel"] is None for ref in unverified))
        self.assertTrue(all(ref["declared_in_resources"] for ref in unverified))

        with tempfile.TemporaryDirectory() as tmp:
            wheel = Path(tmp) / "test.whl"
            with ZipFile(wheel, "w") as archive:
                archive.writestr("holo_ui_mcp/rewampui-components/shared/siteTheme.js", "// helper")
            verified = audit(wheel_path=wheel)["local_imports"]
            self.assertTrue(all(ref["in_wheel"] is True for ref in verified))
            with ZipFile(wheel, "w") as archive:
                archive.writestr("holo_ui_mcp/REGISTRY.json", "{}")
            missing = audit(wheel_path=wheel)["local_imports"]
            self.assertTrue(all(ref["in_wheel"] is False for ref in missing))


if __name__ == "__main__":
    unittest.main()
