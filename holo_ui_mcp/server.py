#!/usr/bin/env python3
"""
Holo UI Vault — Agent-First Model Context Protocol (MCP) Server
Pure Python 3 standard library implementation (Zero external dependencies).
Provides single-step (One-Shot), high-precision UI component retrieval & token resolution.
"""

import json
import os
import sqlite3
import sys

from .engine import HoloUIEngine, format_tool_response

# Ensure UTF-8 I/O across platforms (especially Windows).
for stream in (sys.stdin, sys.stdout, sys.stderr):
    reconfigure = getattr(stream, "reconfigure", None)
    if callable(reconfigure):
        reconfigure(encoding="utf-8")

def find_root_dir() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    # 1. Package install location: REGISTRY.json is packaged alongside server.py
    if os.path.exists(os.path.join(here, "REGISTRY.json")):
        return here
    # 2. Local repo location: server.py is in holo_ui_mcp/ or tools/, REGISTRY.json is in parent
    parent = os.path.dirname(here)
    if os.path.exists(os.path.join(parent, "REGISTRY.json")):
        return parent
    # 3. Fallback to current working directory
    cwd = os.getcwd()
    if os.path.exists(os.path.join(cwd, "REGISTRY.json")):
        return cwd
    return parent


ROOT_DIR = find_root_dir()




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
                        "tools": [engine.tool_definition()],
                    },
                }
                _send(response)

            elif method == "tools/call":
                tool_name = params.get("name")
                tool_args = params.get("arguments", {})

                if tool_name == "get_holo_ui_component":
                    try:
                        if not isinstance(tool_args, dict):
                            raise TypeError("Tool arguments must be an object")
                        matched = engine.search_and_retrieve(**tool_args)
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
                    except (ValueError, TypeError, OSError, RuntimeError, sqlite3.Error) as ex:
                        sys.stderr.write(f"[Holo-UI-MCP] Tool execution error: {ex}\n")
                        response = {
                            "jsonrpc": "2.0",
                            "id": msg_id,
                            "result": {
                                "content": [
                                    {
                                        "type": "text",
                                        "text": "Invalid retrieval request or unavailable asset. Check arguments and server logs.",
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

        except (ValueError, TypeError, AttributeError, OSError) as e:
            sys.stderr.write(f"[Holo-UI-MCP] Loop exception: {e}\n")
    engine.close()


def _send(data: dict):
    line = json.dumps(data, ensure_ascii=False)
    sys.stdout.write(line + "\n")
    sys.stdout.flush()


def run_cli_test(query: str, style=None, category=None, interaction=None):
    engine = HoloUIEngine(ROOT_DIR)
    print(f"=== CLI Test Search: query='{query}', style='{style}', category='{category}', interaction='{interaction}' ===")
    res = engine.search_and_retrieve(query, style=style, category=category, interaction=interaction)
    print(format_tool_response(res))
    engine.close()


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_q = sys.argv[2] if len(sys.argv) > 2 else "thinking state"
        run_cli_test(test_q)
    else:
        run_stdio_server()


if __name__ == "__main__":
    main()
