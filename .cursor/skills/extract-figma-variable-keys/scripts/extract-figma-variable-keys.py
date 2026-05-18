#!/usr/bin/env python3
"""
Fetch Figma Variable import keys from solid fills' boundVariables.color.id.

Requires env: FIGMA_TOKEN, FIGMA_ACCESS_TOKEN, or figma_api_key (see SKILL.md).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request

API = "https://api.figma.com/v1/files"
VAR_ID_RE = re.compile(r"VariableID:([a-f0-9]{40})")


def read_token() -> str:
    for key in ("FIGMA_TOKEN", "FIGMA_ACCESS_TOKEN", "figma_api_key"):
        v = os.environ.get(key, "").strip()
        if v:
            return v
    print(
        "Missing token: set FIGMA_TOKEN, FIGMA_ACCESS_TOKEN, or figma_api_key",
        file=sys.stderr,
    )
    sys.exit(1)


def to_query_id(node_id: str) -> str:
    """Figma nodes query accepts hyphen form (e.g. 88-206)."""
    return node_id.strip().replace(":", "-")


def rgb_to_hex(color: dict) -> str:
    r = int(round(float(color["r"]) * 255))
    g = int(round(float(color["g"]) * 255))
    b = int(round(float(color["b"]) * 255))
    return f"#{r:02x}{g:02x}{b:02x}"


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Extract Variable.key hex strings from Figma node fills."
    )
    ap.add_argument("file_key", help="Figma file key from the design URL")
    ap.add_argument(
        "--ids",
        required=True,
        help="Comma-separated node ids (e.g. 88-206,88:209)",
    )
    args = ap.parse_args()

    ids = [to_query_id(x) for x in args.ids.split(",") if x.strip()]
    if not ids:
        print("No ids provided", file=sys.stderr)
        sys.exit(1)

    query = ",".join(ids)
    url = f"{API}/{args.file_key}/nodes?ids={query}"
    req = urllib.request.Request(
        url,
        headers={"X-Figma-Token": read_token()},
        method="GET",
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            payload = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        print(f"HTTP {e.code}: {body}", file=sys.stderr)
        sys.exit(1)

    if payload.get("error") or payload.get("status") == 403:
        print(json.dumps(payload, indent=2), file=sys.stderr)
        sys.exit(1)

    nodes = payload.get("nodes") or {}
    for qid in ids:
        nid = qid.replace("-", ":")
        wrap = nodes.get(nid)
        if not wrap:
            print(f"{nid}\t(missing in response)", file=sys.stderr)
            continue
        doc = wrap.get("document") or {}
        name = doc.get("name", "")
        fills = doc.get("fills") or []
        if not fills:
            print(f"{nid}\t{name}\t(no fills)")
            continue
        fill = fills[0]
        if fill.get("type") != "SOLID":
            print(f"{nid}\t{name}\t(not SOLID fill)")
            continue
        bv = (fill.get("boundVariables") or {}).get("color") or {}
        vid = bv.get("id") or ""
        m = VAR_ID_RE.match(str(vid))
        key = m.group(1) if m else ""
        color = fill.get("color") or {}
        hex_v = rgb_to_hex(color) if all(k in color for k in ("r", "g", "b")) else ""
        print(f"{nid}\t{name}\t{key}\t{hex_v}")


if __name__ == "__main__":
    main()
