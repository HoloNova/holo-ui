#!/usr/bin/env python3
"""
Holo UI Vault — Agent-First Model Context Protocol (MCP) Server (CLI Runner)
Runs the holo_ui_mcp server from the local repository tools/ directory.
"""

import os
import sys

# Ensure repository root is on sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from holo_ui_mcp.server import main

if __name__ == "__main__":
    main()
