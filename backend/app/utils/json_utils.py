# ============================================
# app/utils/json_utils.py
# ============================================
from __future__ import annotations

import json
from typing import Any


def parse_json_field(value: str | None) -> Any:
    if not value:
        return None
    try:
        return json.loads(value)
    except Exception:
        return value


def parse_used_tools(value: str | None) -> list[str] | None:
    parsed = parse_json_field(value)
    if parsed is None:
        return None
    if isinstance(parsed, list):
        return [str(x) for x in parsed]
    if isinstance(parsed, str):
        return [parsed]
    return [str(parsed)]