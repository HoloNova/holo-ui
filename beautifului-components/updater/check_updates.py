#!/usr/bin/env python3
"""
check_updates.py — Beautiful UI source site change detector

Usage:
  python check_updates.py              # Auto (skip if checked < 4 days ago)
  python check_updates.py --force      # Force check now
  python check_updates.py --json       # Machine-readable JSON output
  python check_updates.py --auto-sync  # Remind to sync if update found

Agent usage:
  After running, read updater/update_log.json:
    status == 'up-to-date'  → use local library safely
    status == 'update-available' → run sync or notify user
    status == 'error' → could not reach site
"""

import sys
import json
import re
import argparse
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Fix Windows console encoding for Unicode/emojis
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ── Config ────────────────────────────────────────────────────────────────────
SOURCE_URL      = "https://www.beautifului.dev/"
CACHE_DAYS      = 4
SCRIPT_DIR      = Path(__file__).parent
SNAPSHOT_FILE   = SCRIPT_DIR / "last_snapshot.json"
LOG_FILE        = SCRIPT_DIR / "update_log.json"


def now_iso() -> str:
    return datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds")


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_json(path: Path, data: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def days_since(iso_str: str) -> float:
    """Return days elapsed since an ISO-8601 timestamp."""
    try:
        dt = datetime.fromisoformat(iso_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone(timedelta(hours=8)))
        delta = datetime.now(timezone(timedelta(hours=8))) - dt
        return delta.total_seconds() / 86400
    except Exception:
        return 999


def fetch_homepage() -> str:
    """Fetch beautifului.dev homepage HTML."""
    req = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "Mozilla/5.0 (compatible; BUI-UpdateChecker/1.0)"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode("utf-8", errors="replace")


def extract_css_hash(html: str) -> str | None:
    """Extract the content hash from the main CSS file URL."""
    match = re.search(r'/_next/static/css/([a-f0-9]+)\.css', html)
    return match.group(1) if match else None


def extract_components(html: str) -> list[dict]:
    """Extract component list from the nav <ul> in the sidebar."""
    components = []
    # Match <a href="#component-id" ...>Name</a> patterns in nav
    pattern = re.compile(
        r'href="(#[\w-]+)"[^>]*class="[^"]*relative z-10[^"]*"[^>]*>([^<]+)<',
        re.DOTALL
    )
    seen = set()
    for m in pattern.finditer(html):
        anchor = m.group(1).lstrip("#")
        name = m.group(2).strip()
        if anchor and anchor not in seen:
            seen.add(anchor)
            components.append({"id": anchor, "name": name})
    return components


def diff_components(
    old: list[dict], new: list[dict]
) -> dict:
    """Compute added/removed/renamed components."""
    old_ids = {c["id"]: c["name"] for c in old}
    new_ids = {c["id"]: c["name"] for c in new}

    added   = [{"id": k, "name": v} for k, v in new_ids.items() if k not in old_ids]
    removed = [{"id": k, "name": v} for k, v in old_ids.items() if k not in new_ids]
    renamed = [
        {"id": k, "old_name": old_ids[k], "new_name": new_ids[k]}
        for k in (old_ids.keys() & new_ids.keys())
        if old_ids[k] != new_ids[k]
    ]
    return {"added": added, "removed": removed, "renamed": renamed}


def check(args) -> dict:
    """Run the actual update check. Returns result dict."""
    if not getattr(args, "json", False):
        print(f"[*] Fetching {SOURCE_URL} ...", file=sys.stderr, flush=True)
    try:
        html = fetch_homepage()
    except urllib.error.URLError as e:
        return {"status": "error", "error": str(e)}
    except Exception as e:
        return {"status": "error", "error": str(e)}

    css_hash   = extract_css_hash(html)
    components = extract_components(html)
    snapshot   = load_json(SNAPSHOT_FILE)

    old_hash       = snapshot.get("css_hash")
    old_components = snapshot.get("components", [])

    hash_changed  = css_hash and css_hash != old_hash
    comp_diff     = diff_components(old_components, components)
    comp_changed  = bool(comp_diff["added"] or comp_diff["removed"] or comp_diff["renamed"])
    has_changes   = hash_changed or comp_changed

    changes = []
    if hash_changed:
        changes.append({
            "type":     "css_updated",
            "old_hash": old_hash,
            "new_hash": css_hash,
        })
    if comp_diff["added"]:
        changes.append({"type": "components_added",   "items": comp_diff["added"]})
    if comp_diff["removed"]:
        changes.append({"type": "components_removed",  "items": comp_diff["removed"]})
    if comp_diff["renamed"]:
        changes.append({"type": "components_renamed",  "items": comp_diff["renamed"]})

    status = "update-available" if has_changes else "up-to-date"

    # Update snapshot if anything changed
    if has_changes and components:
        new_snapshot = {
            "snapshot_at":     now_iso(),
            "css_hash":        css_hash or old_hash,
            "css_url":         f"/_next/static/css/{css_hash}.css" if css_hash else snapshot.get("css_url"),
            "component_count": len(components),
            "components":      components,
        }
        save_json(SNAPSHOT_FILE, new_snapshot)

    return {
        "status":          status,
        "css_hash":        css_hash,
        "component_count": len(components),
        "changes":         changes,
        "comp_diff":       comp_diff,
    }


def update_log(result: dict, log: dict) -> dict:
    """Merge result into log file and return updated log."""
    history_entry = {
        "checked_at": now_iso(),
        "status":     result["status"],
        "changes":    result.get("changes", []),
    }
    history = log.get("history", [])[-19:]  # keep last 20
    history.append(history_entry)

    updated = {
        "last_checked":    now_iso(),
        "last_synced":     log.get("last_synced", now_iso()),
        "status":          result["status"],
        "use_local":       result["status"] == "up-to-date",
        "days_since_check": 0,
        "changes":         result.get("changes", []),
        "history":         history,
    }
    return updated


def print_result(result: dict, cached: bool = False):
    """Pretty-print the result to stdout."""
    status = result.get("status", "unknown")
    icon   = {"up-to-date": "[OK]", "update-available": "[UPDATE]", "error": "[ERROR]"}.get(status, "[?]")

    if cached:
        print(f"{icon} [{status.upper()}] (cached -- use --force to re-check)")
        return

    print(f"\n{icon} Status: {status.upper()}")

    if status == "error":
        print(f"   Error: {result.get('error')}")
        return

    print(f"   CSS hash : {result.get('css_hash', 'unknown')}")
    print(f"   Components: {result.get('component_count', '?')}")

    changes = result.get("changes", [])
    if not changes:
        print("   No changes detected -- local library is current.")
    else:
        print(f"   Changes detected ({len(changes)}):")
        for c in changes:
            t = c["type"]
            if t == "css_updated":
                print(f"     * CSS updated: {c['old_hash'][:8]}... -> {c['new_hash'][:8]}...")
            elif t == "components_added":
                for item in c["items"]:
                    print(f"     [+] New component: {item['name']} (#{item['id']})")
            elif t == "components_removed":
                for item in c["items"]:
                    print(f"     [-] Removed: {item['name']} (#{item['id']})")
            elif t == "components_renamed":
                for item in c["items"]:
                    print(f"     [*] Renamed: {item['old_name']} -> {item['new_name']}")
        print()
        print("   Run sync to update local library:")
        print("      python updater/sync_components.py")


def main():
    parser = argparse.ArgumentParser(description="Check beautifului.dev for updates")
    parser.add_argument("--force",     action="store_true", help="Skip cache, check now")
    parser.add_argument("--json",      action="store_true", help="Output JSON only")
    parser.add_argument("--auto-sync", action="store_true", help="Remind to sync if update found")
    args = parser.parse_args()

    log = load_json(LOG_FILE)
    age = days_since(log.get("last_checked", ""))

    # Use cache if recent enough
    if not args.force and age < CACHE_DAYS:
        cached_result = {
            "status":          log.get("status", "unknown"),
            "use_local":       log.get("use_local", True),
            "days_since_check": round(age, 1),
            "last_checked":    log.get("last_checked"),
            "cached":          True,
        }
        if args.json:
            print(json.dumps(cached_result, ensure_ascii=False, indent=2))
        else:
            print(f"[*] Last checked {age:.1f} days ago (cache valid for {CACHE_DAYS} days).")
            print_result(cached_result, cached=True)
        sys.exit(0)

    # Run live check
    result = check(args)
    log    = update_log(result, log)
    save_json(LOG_FILE, log)

    if args.json:
        print(json.dumps({**result, "last_checked": log["last_checked"]},
                          ensure_ascii=False, indent=2))
    else:
        print_result(result)

    if args.auto_sync and result.get("status") == "update-available":
        print("\n[*] Auto-sync reminder: run python updater/sync_components.py")

    # Exit code: 0=ok, 1=update available, 2=error
    code_map = {"up-to-date": 0, "update-available": 1, "error": 2}
    sys.exit(code_map.get(result.get("status", "error"), 2))


if __name__ == "__main__":
    main()
