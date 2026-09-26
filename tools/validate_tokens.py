#!/usr/bin/env python3
"""Validate canonical metadata, asset references and generated compatibility views."""

import sys
from collections import Counter
from pathlib import Path


def main():
    root = Path(__file__).resolve().parents[1]
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    from holo_ui_mcp.catalog import Catalog
    from tools.build_index import main as build_index

    status = build_index(['--check'])
    if status:
        return status
    catalog = Catalog(root)
    print(f'[PASSED] {len(catalog.components)} components passed registry validation')
    for dimension in catalog.dimensions:
        counts = Counter(comp['tokens'][dimension] for comp in catalog.components.values())
        print(dimension + ': ' + ', '.join(f'{value}={count}' for value, count in sorted(counts.items())))
    return 0


if __name__ == '__main__':
    sys.exit(main())
