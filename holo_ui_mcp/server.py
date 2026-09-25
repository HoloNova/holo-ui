#!/usr/bin/env python3
"""
Holo UI Vault — Agent-First Model Context Protocol (MCP) Server
Pure Python 3 standard library implementation (Zero external dependencies).
Provides single-step (One-Shot), high-precision UI component retrieval & token resolution.
"""

import json
import os
import re
import sys

# Ensure UTF-8 I/O across platforms (especially Windows)
if hasattr(sys.stdin, "reconfigure"):
    sys.stdin.reconfigure(encoding="utf-8")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

def find_root_dir() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    # 1. Package install location: INDEX.json is packaged alongside server.py
    if os.path.exists(os.path.join(here, "INDEX.json")):
        return here
    # 2. Local repo location: server.py is in holo_ui_mcp/ or tools/, INDEX.json is in parent
    parent = os.path.dirname(here)
    if os.path.exists(os.path.join(parent, "INDEX.json")):
        return parent
    # 3. Fallback to current working directory
    cwd = os.getcwd()
    if os.path.exists(os.path.join(cwd, "INDEX.json")):
        return cwd
    return parent


ROOT_DIR = find_root_dir()


class HoloUIEngine:
    """In-memory indexing and matching engine for Holo UI components and tokens."""

    def __init__(self, root_dir: str):
        self.root_dir = root_dir
        self.router_path = os.path.join(root_dir, "ROUTER.json")
        self.index_path = os.path.join(root_dir, "INDEX.json")
        self.components = {}  # cid -> component dict
        self.router = {}
        self.styles = {}
        self.css_cache = {}
        self._load_data()

    def _load_data(self):
        try:
            with open(self.router_path, "r", encoding="utf-8") as f:
                self.router = json.load(f)
        except Exception as e:
            sys.stderr.write(f"[Holo-UI-MCP] Failed to load ROUTER.json: {e}\n")
            self.router = {}

        try:
            with open(self.index_path, "r", encoding="utf-8") as f:
                idx = json.load(f)
        except Exception as e:
            sys.stderr.write(f"[Holo-UI-MCP] Failed to load INDEX.json: {e}\n")
            idx = {}

        self.styles = idx.get("by_style", {})

        # Flatten components from INDEX.json
        for cat_name, cat_obj in idx.get("by_function", {}).items():
            for item in cat_obj.get("items", []):
                cid = item.get("id")
                if cid:
                    self.components[cid] = item

    def _read_file_cached(self, rel_path: str) -> str:
        if not rel_path:
            return ""
        if rel_path in self.css_cache:
            return self.css_cache[rel_path]
        full_path = os.path.join(self.root_dir, rel_path)
        if os.path.exists(full_path):
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    self.css_cache[rel_path] = content
                    return content
            except Exception as e:
                sys.stderr.write(f"[Holo-UI-MCP] Error reading {rel_path}: {e}\n")
        return ""

    def _extract_css_for_component(self, cid: str, style: str) -> str:
        """Extract only the essential CSS tokens and animation keyframes for the target component."""
        if style == "ai_native_productivity":
            full_css = self._read_file_cached("beautifului-components/shared/base.css")
            if not full_css:
                return ""
            css_blocks = []
            root_match = re.search(r"(:root\s*\{[^}]+\})", full_css, re.DOTALL)
            if root_match:
                css_blocks.append("/* Core OKLCH Design Tokens (Light) */\n" + root_match.group(1))
            dark_match = re.search(r"(\.dark\s*\{[^}]+\})", full_css, re.DOTALL)
            if dark_match:
                css_blocks.append("/* Core OKLCH Design Tokens (Dark) */\n" + dark_match.group(1))

            for kf in ["shimmer-text", "pixel-fade", "pulse-subtle", "spin-smooth"]:
                kf_pattern = rf"(@keyframes\s+{kf}\s*\{{[^}}]+\}})"
                kf_match = re.search(kf_pattern, full_css, re.DOTALL)
                if kf_match:
                    css_blocks.append(kf_match.group(1))

            return "\n\n".join(css_blocks)

        elif style == "micro_motion_indicators":
            full_css = self._read_file_cached("loadingdev-components/shared/base.css")
            if not full_css:
                return ""
            css_blocks = [
                "/* Micro-motion Global Variables */\n:root {\n  --ld-size: 24px;\n  --ld-duration: 800ms;\n  --ld-play-state: running;\n}"
            ]
            pattern = rf"((\.{re.escape(cid)}[^{{]*\{{[^}}]*\}}|@keyframes\s+{re.escape(cid)}[^{{]*\{{[^}}]*\}})+)"
            matches = re.findall(pattern, full_css, re.DOTALL)
            if matches:
                for m in matches:
                    rule = m[0].strip()
                    if rule and rule not in css_blocks:
                        css_blocks.append(rule)
            else:
                lines = full_css.split("\n")
                capturing = False
                current_rule = []
                for line in lines:
                    if f".{cid}" in line:
                        capturing = True
                    if capturing:
                        current_rule.append(line)
                        if line.strip() == "}":
                            capturing = False
                            css_blocks.append("\n".join(current_rule))
                            current_rule = []
            return "\n\n".join(css_blocks)

        elif style == "kinetic_motion_tactile":
            tokens_css = self._read_file_cached("rewampui-components/shared/tokens.css")
            base_css = self._read_file_cached("rewampui-components/shared/base.css")
            combined = []
            if tokens_css:
                combined.append("/* Rewamp UI Kinetic & Spring Tokens */\n" + tokens_css)
            if base_css:
                combined.append("/* Rewamp UI Keyframes & Blur Utilities */\n" + base_css)
            return "\n\n".join(combined)

        elif style == "apple_human_interface":
            return self._read_file_cached("guidelines/apple-design/tokens/tokens.css")

        return ""

    def search_and_retrieve(
        self,
        query: str,
        style: str = None,
        category: str = None,
        interaction: str = None,
        motion: str = None,
        scale: str = None,
        component_id: str = None,
    ) -> dict:
        """Score, match, and return 1 to 3 components with their code & CSS."""
        if component_id and component_id in self.router.get("components", {}):
            comp = self.components.get(component_id, {})
            return self._build_result(
                [(comp or {"id": component_id, "style": style or "ai_native_productivity"}, 9999)],
                query,
                is_direct=True,
            )

        normalized_q = (query or "").lower().strip()
        if style == "apple_human_interface" or any(w in normalized_q for w in ["apple", "hig", "liquid glass", "squircle", "44pt"]):
            apple_tokens = self._read_file_cached("guidelines/apple-design/tokens/tokens.css")
            apple_design_md = self._read_file_cached("guidelines/apple-design/DESIGN.md")
            apple_prompt = self._read_file_cached("guidelines/apple-design/PROMPT_PRESET.md")
            return {
                "count": 1,
                "components": [
                    {
                        "id": "apple-human-interface-tokens",
                        "name": "Apple Human Interface Design System & Tokens",
                        "style": "apple_human_interface",
                        "when": "Consumer-facing interfaces, mobile/PWA web apps, settings lists, modals with liquid glass & squircle curvature.",
                        "when_not": "High-density data tickers or raw terminal CLI UIs.",
                        "code": apple_tokens,
                        "code_type": "css",
                        "design_md": apple_design_md,
                        "design_md_path": "guidelines/apple-design/DESIGN.md",
                        "guideline": apple_prompt,
                    }
                ],
                "selection_strategy": "Apple HIG design system specification",
            }

        keyword_style_boost = None
        for kw_pattern, target_style in self.router.get("keywords", {}).items():
            if re.search(rf"\b({kw_pattern})\b", normalized_q):
                keyword_style_boost = target_style
                break

        scored_candidates = []
        q_tokens = set(re.findall(r"\w+", normalized_q))

        for cid, comp in self.components.items():
            score = 0
            c_style = comp.get("style", "")
            c_tokens = comp.get("tokens", {})
            c_name = comp.get("name", "").lower()
            c_aliases = [a.lower() for a in comp.get("aliases", [])]
            c_when = comp.get("when", "").lower()
            c_when_not = comp.get("when_not", "").lower()

            if cid in normalized_q or normalized_q in cid:
                score += 120
            for alias in c_aliases:
                if alias in normalized_q:
                    score += 100
                    break

            if keyword_style_boost and c_style == keyword_style_boost:
                score += 30

            if style:
                if c_style == style:
                    score += 35
                else:
                    score -= 30

            if category:
                if c_tokens.get("category") == category:
                    score += 40
                else:
                    score -= 10

            if interaction:
                if c_tokens.get("interaction") == interaction:
                    score += 35
                else:
                    score -= 10

            if motion:
                if c_tokens.get("motion") == motion:
                    score += 25

            if scale:
                if c_tokens.get("scale") == scale:
                    score += 20

            for qt in q_tokens:
                if qt in cid:
                    score += 25
                elif qt in c_name:
                    score += 20
                elif any(qt in a for a in c_aliases):
                    score += 25
                elif qt in c_when:
                    score += 10
                if qt in c_when_not:
                    score -= 20

            if score > 0:
                scored_candidates.append((comp, score))

        scored_candidates.sort(key=lambda x: x[1], reverse=True)

        if not scored_candidates:
            default_comp = self.components.get("thinking-state", {})
            return self._build_result([(default_comp, 1)], query, is_fallback=True)

        top_1 = scored_candidates[0]
        selected = [top_1]

        if len(scored_candidates) > 1:
            top_2 = scored_candidates[1]
            score_gap = top_1[1] - top_2[1]
            is_precise_hit = top_1[1] >= 80 and score_gap >= 35

            if not is_precise_hit:
                selected.append(top_2)
                if len(scored_candidates) > 2 and scored_candidates[2][1] > 0:
                    selected.append(scored_candidates[2])

        return self._build_result(selected, query)

    def _build_result(self, selected_candidates, query: str, is_direct: bool = False, is_fallback: bool = False) -> dict:
        results = []
        for comp, score in selected_candidates:
            cid = comp.get("id")
            rel_snippet_path = self.router.get("components", {}).get(cid)
            snippet_code = self._read_file_cached(rel_snippet_path)
            c_style = comp.get("style", "")
            css_bundle = self._extract_css_for_component(cid, c_style)

            code_type = "html"
            if rel_snippet_path:
                if rel_snippet_path.endswith(".tsx") or rel_snippet_path.endswith(".jsx"):
                    code_type = "react"

            results.append(
                {
                    "id": cid,
                    "name": comp.get("name", cid),
                    "style": c_style,
                    "match_score": score,
                    "tokens": comp.get("tokens", {}),
                    "when": comp.get("when", ""),
                    "when_not": comp.get("when_not", ""),
                    "code_type": code_type,
                    "design_md": self.styles.get(c_style, {}).get("design_md", ""),
                    "snippet": snippet_code,
                    "essential_css": css_bundle,
                }
            )

        strategy = "single_precise_hit" if len(results) == 1 else "multi_candidate_comparison"
        if is_direct:
            strategy = "direct_id_lookup"
        elif is_fallback:
            strategy = "fallback_general"

        return {
            "count": len(results),
            "selection_strategy": strategy,
            "components": results,
            "instruction": (
                "The code above is the Holo UI canonical reference primitive. "
                "Transform and assemble it directly into the user's project framework (Vue, React, Svelte, Tailwind, etc.) "
                "while preserving the CSS custom properties, accessibility attributes, and motion dynamics."
            ),
        }


TOOL_DEFINITION = {
    "name": "get_holo_ui_component",
    "description": (
        "Retrieve verified, production-ready UI component primitives and style tokens from Holo UI Vault.\n\n"
        "WHEN TO CALL (Trigger Criteria):\n"
        "- When the user asks to build, improve, or style web UI components (e.g. AI thinking/reasoning accordions, "
        "loading states, streaming text, approval/permission cards, prompt input bars, tactile buttons, "
        "interactive toggles, 3D cards, data diff tables, or micro-motion loaders/spinners).\n"
        "- When designing modern interfaces following AI-Native Productivity, Apple HIG Liquid Glass/Squircle, "
        "or Kinetic Tactile Motion design systems.\n\n"
        "FRAMEWORK CONVERSION:\n"
        "The returned code is the canonical design primitive (HTML/CSS or React). You MUST automatically "
        "transform and integrate it into the user's project tech stack (Vue 3, React JSX, Svelte, Tailwind) "
        "without hallucinating CSS variables or motion curves."
    ),
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "User intent, keyword, or component name (e.g. 'thinking state', 'approval card', 'slide to confirm', 'table diff', 'arc loader').",
            },
            "style": {
                "type": "string",
                "enum": [
                    "ai_native_productivity",
                    "apple_human_interface",
                    "kinetic_motion_tactile",
                    "micro_motion_indicators",
                ],
                "description": (
                    "Target design aesthetic:\n"
                    "- 'ai_native_productivity': Dark-first, 0.5px hairlines, OKLCH, AI SaaS, thinking trace, prompt bar\n"
                    "- 'apple_human_interface': Liquid glass blur, squircle curvature, 44pt touch, HIG guidelines\n"
                    "- 'kinetic_motion_tactile': Spring damping physics, 3D orbits, tactile buttons, landing pages\n"
                    "- 'micro_motion_indicators': Pure CSS/SVG zero-runtime micro loaders, radars, circular dots"
                ),
            },
            "category": {
                "type": "string",
                "enum": [
                    "status",
                    "action",
                    "composer",
                    "gate",
                    "data",
                    "nav",
                    "setting",
                    "text-effect",
                    "showcase",
                    "avatar",
                    "content",
                    "workflow",
                    "ai-response",
                    "code",
                    "diagram",
                    "scaffold",
                ],
                "description": "Functional category. Common: 'status' (loaders, thinking state), 'action' (buttons), 'composer' (prompt input), 'gate' (approval cards), 'data' (diff/filter tables).",
            },
            "interaction": {
                "type": "string",
                "enum": ["output", "control", "input", "navigation", "confirmation"],
                "description": "Interaction depth: 'output' (display only), 'control' (expandable accordion, toggle), 'input' (form/composer), 'navigation' (pill/sidebar), 'confirmation' (slide to confirm, approval card).",
            },
            "motion": {
                "type": "string",
                "enum": ["none", "transition", "css-loop", "spring", "webgl"],
                "description": "Motion physics: 'none', 'transition' (accordion expand), 'css-loop' (spinners, radar), 'spring' (physics damping), 'webgl' (fluid orbs).",
            },
            "scale": {
                "type": "string",
                "enum": ["micro", "compact", "standard", "region", "viewport"],
                "description": "Component size: 'micro' (inline spinners), 'compact' (buttons, toggles), 'standard' (cards, composers), 'region' (tables, sidebars), 'viewport' (full agent screen).",
            },
            "component_id": {
                "type": "string",
                "description": "Exact component ID if known (e.g. 'thinking-state', 'approval-card', 'slide-to-confirm-button', 'ld-arc'). If provided, fetches directly.",
            },
        },
        "required": ["query"],
    },
}


def format_tool_response(result_data: dict) -> str:
    """Format structured search results into readable Markdown payload for the LLM."""
    parts = []
    count = result_data.get("count", 0)
    strategy = result_data.get("selection_strategy", "")

    if strategy == "Apple HIG design system specification":
        comp = result_data["components"][0]
        parts.append(f"## [Holo UI — Apple Human Interface Guidelines & Tokens]\n")
        parts.append(f"**When to use**: {comp['when']}\n")
        parts.append(f"### CSS Tokens (`tokens.css`):\n```css\n{comp['code']}\n```\n")
        parts.append(f"### Design Directives & Prompt Presets:\n{comp['guideline']}\n")
        return "\n".join(parts)

    parts.append(f"### Holo UI Vault Asset Retrieval (Matched {count} component{'s' if count > 1 else ''})\n")

    for i, c in enumerate(result_data.get("components", []), start=1):
        parts.append(f"---")
        parts.append(f"#### Component #{i}: {c['name']} (ID: `{c['id']}`)")
        parts.append(f"- **Style**: `{c['style']}`")
        if c.get("tokens"):
            tokens_str = ", ".join(f"{k}: {v}" for k, v in c["tokens"].items())
            parts.append(f"- **Feature Tokens**: {tokens_str}")
        parts.append(f"- **Usage Guide**: {c['when']}")
        if c.get("when_not"):
            parts.append(f"- **Anti-Pattern Guard**: {c['when_not']}")

        code_lang = "html" if c.get("code_type") == "html" else "tsx"
        parts.append(f"\n##### Reference Code Snippet (`{c['id']}`):\n```{code_lang}\n{c['snippet']}\n```")

        if c.get("essential_css"):
            parts.append(f"\n##### Essential CSS Tokens & Keyframes:\n```css\n{c['essential_css']}\n```")

    parts.append("\n---")
    parts.append(f"**Framework Transformation Notice**: {result_data.get('instruction', '')}")
    return "\n".join(parts)


def run_stdio_server():
    """Main JSON-RPC stdio event loop."""
    engine = HoloUIEngine(ROOT_DIR)
    sys.stderr.write(f"[Holo-UI-MCP] Server initialized with {len(engine.components)} components from {ROOT_DIR}\n")

    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break

            line = line.strip()
            if not line:
                continue

            try:
                request = json.loads(line)
            except json.JSONDecodeError as err:
                sys.stderr.write(f"[Holo-UI-MCP] Invalid JSON: {err}\n")
                continue

            msg_id = request.get("id")
            method = request.get("method")
            params = request.get("params", {})

            if method == "initialize":
                response = {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {
                            "tools": {},
                        },
                        "serverInfo": {
                            "name": "holo-ui-mcp",
                            "version": "1.0.0",
                        },
                    },
                }
                _send(response)

            elif method == "notifications/initialized":
                pass

            elif method == "ping":
                _send({"jsonrpc": "2.0", "id": msg_id, "result": {}})

            elif method == "tools/list":
                response = {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {
                        "tools": [TOOL_DEFINITION],
                    },
                }
                _send(response)

            elif method == "tools/call":
                tool_name = params.get("name")
                tool_args = params.get("arguments", {})

                if tool_name == "get_holo_ui_component":
                    try:
                        matched = engine.search_and_retrieve(
                            query=tool_args.get("query", ""),
                            style=tool_args.get("style"),
                            category=tool_args.get("category"),
                            interaction=tool_args.get("interaction"),
                            motion=tool_args.get("motion"),
                            scale=tool_args.get("scale"),
                            component_id=tool_args.get("component_id"),
                        )
                        formatted_text = format_tool_response(matched)
                        response = {
                            "jsonrpc": "2.0",
                            "id": msg_id,
                            "result": {
                                "content": [
                                    {
                                        "type": "text",
                                        "text": formatted_text,
                                    }
                                ],
                                "isError": False,
                            },
                        }
                    except Exception as ex:
                        sys.stderr.write(f"[Holo-UI-MCP] Tool execution error: {ex}\n")
                        response = {
                            "jsonrpc": "2.0",
                            "id": msg_id,
                            "result": {
                                "content": [
                                    {
                                        "type": "text",
                                        "text": f"Error retrieving Holo UI component: {str(ex)}",
                                    }
                                ],
                                "isError": True,
                            },
                        }
                else:
                    response = {
                        "jsonrpc": "2.0",
                        "id": msg_id,
                        "error": {
                            "code": -32601,
                            "message": f"Unknown tool: {tool_name}",
                        },
                    }
                _send(response)

            elif method == "resources/list":
                _send({"jsonrpc": "2.0", "id": msg_id, "result": {"resources": []}})
            elif method == "prompts/list":
                _send({"jsonrpc": "2.0", "id": msg_id, "result": {"prompts": []}})
            else:
                if msg_id is not None:
                    _send(
                        {
                            "jsonrpc": "2.0",
                            "id": msg_id,
                            "error": {
                                "code": -32601,
                                "message": f"Method '{method}' not found",
                            },
                        }
                    )

        except Exception as e:
            sys.stderr.write(f"[Holo-UI-MCP] Loop exception: {e}\n")


def _send(data: dict):
    line = json.dumps(data, ensure_ascii=False)
    sys.stdout.write(line + "\n")
    sys.stdout.flush()


def run_cli_test(query: str, style: str = None, category: str = None, interaction: str = None):
    engine = HoloUIEngine(ROOT_DIR)
    print(f"=== CLI Test Search: query='{query}', style='{style}', category='{category}', interaction='{interaction}' ===")
    res = engine.search_and_retrieve(query, style=style, category=category, interaction=interaction)
    print(format_tool_response(res))


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_q = sys.argv[2] if len(sys.argv) > 2 else "thinking state"
        run_cli_test(test_q)
    else:
        run_stdio_server()


if __name__ == "__main__":
    main()
