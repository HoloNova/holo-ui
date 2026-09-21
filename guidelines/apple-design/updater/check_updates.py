#!/usr/bin/env python3
"""
check_updates.py — Apple Design Portal (developer.apple.com/design/) Change Detector

Usage:
  python check_updates.py              # Auto (skip if checked < 4 days ago)
  python check_updates.py --force      # Force live check now
  python check_updates.py --json       # Output JSON only (for AI Agents)

Agent Usage:
  Read updater/update_log.json:
    use_local == True  -> use local Apple Design guidelines safely
    status == 'update-available' -> Apple has updated design sessions or resources
"""

import sys
import json
import re
import argparse
import hashlib
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Fix Windows console encoding
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ── Config ────────────────────────────────────────────────────────────────────
SOURCE_URL      = "https://developer.apple.com/design/"
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
    try:
        dt = datetime.fromisoformat(iso_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone(timedelta(hours=8)))
        delta = datetime.now(timezone(timedelta(hours=8))) - dt
        return delta.total_seconds() / 86400
    except Exception:
        return 999


def fetch_portal() -> tuple[str, dict]:
    """Fetch developer.apple.com/design/ HTML and response headers."""
    req = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleDesignChecker/1.0"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        headers = dict(resp.headers)
        content = resp.read().decode("utf-8", errors="replace")
        return content, headers


def extract_features(html: str) -> dict:
    """Extract key design features: videos, tools, and links."""
    # Find WWDC video links
    videos = re.findall(r'href="(/videos/play/wwdc\d+/\d+/)"[^>]*>([^<]+)<', html)
    video_list = [{"url": v[0], "title": v[1].strip()} for v in videos]

    # Find featured design resources (like SF Symbols, Icon Composer)
    tools = re.findall(r'href="(/[\w-]+/)"[^>]*>(Icon Composer|SF Symbols|Pass Designer|Reality Composer Pro|Fonts)', html)
    tool_list = list({t[1]: t[0] for t in tools}.keys())

    # Compute page content hash
    content_hash = hashlib.sha256(html.encode("utf-8")).hexdigest()[:16]

    return {
        "content_hash": content_hash,
        "videos": video_list,
        "featured_tools": tool_list
    }


def check(args) -> dict:
    if not getattr(args, "json", False):
        print(f"[*] Checking {SOURCE_URL} for design updates...", file=sys.stderr, flush=True)

    try:
        html, headers = fetch_portal()
    except urllib.error.URLError as e:
        return {"status": "error", "error": str(e)}
    except Exception as e:
        return {"status": "error", "error": str(e)}

    features = extract_features(html)
    snapshot = load_json(SNAPSHOT_FILE)

    old_hash = snapshot.get("content_hash")
    old_videos = snapshot.get("videos", [])
    old_tools = snapshot.get("featured_tools", [])

    hash_changed = old_hash and features["content_hash"] != old_hash
    new_videos = [v for v in features["videos"] if v not in old_videos]
    new_tools = [t for t in features["featured_tools"] if t not in old_tools]

    changes = []
    if hash_changed:
        changes.append({"type": "content_updated", "old_hash": old_hash, "new_hash": features["content_hash"]})
    if new_videos:
        changes.append({"type": "new_design_videos", "items": new_videos})
    if new_tools:
        changes.append({"type": "new_design_tools", "items": new_tools})

    status = "update-available" if bool(changes) else "up-to-date"

    if changes:
        new_snapshot = {
            "snapshot_at": now_iso(),
            "content_hash": features["content_hash"],
            "videos": features["videos"],
            "featured_tools": features["featured_tools"],
            "etag": headers.get("ETag", ""),
            "last_modified": headers.get("Last-Modified", "")
        }
        save_json(SNAPSHOT_FILE, new_snapshot)

    return {
        "status": status,
        "content_hash": features["content_hash"],
        "videos_count": len(features["videos"]),
        "tools_count": len(features["featured_tools"]),
        "changes": changes
    }


def update_log(result: dict, log: dict) -> dict:
    history = log.get("history", [])[-19:]
    history.append({
        "checked_at": now_iso(),
        "status": result["status"],
        "changes": result.get("changes", [])
    })

    return {
        "last_checked": now_iso(),
        "last_synced": log.get("last_synced", now_iso()),
        "status": result["status"],
        "use_local": result["status"] == "up-to-date",
        "days_since_check": 0,
        "changes": result.get("changes", []),
        "history": history
    }


def main():
    parser = argparse.ArgumentParser(description="Check developer.apple.com/design for updates")
    parser.add_argument("--force", action="store_true", help="Skip cache, check now")
    parser.add_argument("--json", action="store_true", help="Output JSON only")
    args = parser.parse_args()

    log = load_json(LOG_FILE)
    age = days_since(log.get("last_checked", ""))

    if not args.force and age < CACHE_DAYS:
        cached_result = {
            "status": log.get("status", "up-to-date"),
            "use_local": log.get("use_local", True),
            "days_since_check": round(age, 1),
            "last_checked": log.get("last_checked"),
            "cached": True
        }
        if args.json:
            print(json.dumps(cached_result, ensure_ascii=False, indent=2))
        else:
            print(f"[*] Apple Design checked {age:.1f} days ago (cache valid for {CACHE_DAYS} days).")
            print(f"[OK] Status: {cached_result['status'].upper()} (cached — use --force to re-check)")
        sys.exit(0)

    result = check(args)
    log = update_log(result, log)
    save_json(LOG_FILE, log)

    if args.json:
        print(json.dumps({**result, "last_checked": log["last_checked"]}, ensure_ascii=False, indent=2))
    else:
        print(f"\n[*] Status: {result['status'].upper()}")
        print(f"    Page Hash: {result.get('content_hash')}")
        print(f"    Videos Indexed: {result.get('videos_count', 0)}")
        print(f"    Design Tools: {result.get('tools_count', 0)}")
        if result.get("changes"):
            print("    [!] Changes detected on Apple Design Portal!")
            for c in result["changes"]:
                print(f"        - {c['type']}")
        else:
            print("    [OK] Local guidelines are up-to-date with Apple Design.")

    sys.exit(0 if result.get("status") == "up-to-date" else 1)


if __name__ == "__main__":
    main()
