#!/usr/bin/env python3
"""Data quality pipeline for PoliticalPulse.

The quality report highlights duplicate records, missing timestamps, missing
platforms, invalid engagement values, impossible dates, empty text, language
uncertainty, and malformed URLs. It writes a JSON report to the data folder so
that the frontend and API can consume quality statistics.
"""

from __future__ import annotations

import csv
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
REPORT_PATH = DATA_DIR / "data_quality_report.json"

ALLOWED_LANGUAGES = {"Kannada", "English", "Hindi", "Mixed", "Other", "Bilingual"}
ALLOWED_SENTIMENTS = {"positive", "neutral", "negative"}


def safe_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def parse_datetime(value: Any) -> datetime | None:
    text = safe_text(value)
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        pass

    for fmt in [
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%d %H:%M:%S%z",
    ]:
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    return None


def is_valid_url(value: Any) -> bool:
    text = safe_text(value)
    if not text:
        return False
    parsed = urlparse(text)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def detect_duplicates(rows: list[dict[str, Any]], key_fields: list[str]) -> tuple[list[str], int]:
    seen: set[str] = set()
    duplicates: list[str] = []
    for row in rows:
        signature = "|".join(safe_text(row.get(field, "")) for field in key_fields)
        if not signature:
            continue
        if signature in seen:
            duplicates.append(signature)
        else:
            seen.add(signature)
    return duplicates, len(duplicates)


def assess_dataset(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)

    issues: dict[str, list[str]] = {"duplicate_rows": [], "missing_timestamps": [], "missing_platform": [], "invalid_engagement": [], "impossible_dates": [], "empty_text": [], "language_uncertainty": [], "malformed_urls": []}

    duplicates, duplicate_count = detect_duplicates(rows, ["source_post_id", "platform", "published_at", "body"]) if path.name.startswith("posts") else detect_duplicates(rows, ["post_source_id", "platform", "published_at", "body"]) if path.name.startswith("comments") else detect_duplicates(rows, ["politician_name", "platform", "handle"]) if path.name.startswith("accounts") else detect_duplicates(rows, ["politician_name", "peer_name", "peer_group_name"]) if path.name.startswith("peers") else ([], 0)
    issues["duplicate_rows"] = duplicates

    for index, row in enumerate(rows, start=1):
        published = row.get("published_at") or row.get("date") or row.get("timestamp")
        if not safe_text(published):
            issues["missing_timestamps"].append(f"row {index}: missing published_at")
            continue
        parsed = parse_datetime(published)
        if parsed is None:
            issues["impossible_dates"].append(f"row {index}: invalid date '{published}'")

        platform = safe_text(row.get("platform"))
        if not platform:
            issues["missing_platform"].append(f"row {index}: missing platform")

        text_fields = [row.get("body"), row.get("text"), row.get("comment"), row.get("title")]
        if all(not safe_text(value) for value in text_fields):
            issues["empty_text"].append(f"row {index}: empty text content")

        language = safe_text(row.get("language", "")).strip()
        if language and language not in ALLOWED_LANGUAGES:
            issues["language_uncertainty"].append(f"row {index}: language='{language}' not in accepted taxonomy")

        if "sentiment" in row:
            sentiment = safe_text(row.get("sentiment")).lower()
            if sentiment and sentiment not in ALLOWED_SENTIMENTS:
                issues["language_uncertainty"].append(f"row {index}: sentiment='{sentiment}' is not a supported label")

        url = safe_text(row.get("url") or row.get("source_url") or row.get("account_url") or "")
        if url and not is_valid_url(url):
            issues["malformed_urls"].append(f"row {index}: malformed URL '{url}'")

        engagement_fields = [
            row.get("likes"),
            row.get("comments"),
            row.get("shares"),
            row.get("views"),
            row.get("follower_count"),
        ]
        for field_name, value in [
            ("likes", row.get("likes")),
            ("comments", row.get("comments")),
            ("shares", row.get("shares")),
            ("views", row.get("views")),
            ("follower_count", row.get("follower_count")),
        ]:
            if value is None or safe_text(value) == "":
                continue
            try:
                numeric = int(float(str(value).replace(",", "")))
            except ValueError:
                issues["invalid_engagement"].append(f"row {index}: invalid numeric value for {field_name}='{value}'")
                continue
            if numeric < 0:
                issues["invalid_engagement"].append(f"row {index}: negative value for {field_name}={numeric}")

    summary = {
        "dataset": path.stem,
        "rows_checked": len(rows),
        "duplicate_rows": duplicate_count,
        "missing_timestamps": len(issues["missing_timestamps"]),
        "missing_platform": len(issues["missing_platform"]),
        "invalid_engagement": len(issues["invalid_engagement"]),
        "impossible_dates": len(issues["impossible_dates"]),
        "empty_text": len(issues["empty_text"]),
        "language_uncertainty": len(issues["language_uncertainty"]),
        "malformed_urls": len(issues["malformed_urls"]),
        "issues": {key: value for key, value in issues.items() if value},
    }
    return summary


def build_report() -> dict[str, Any]:
    dataset_files = sorted(DATA_DIR.glob("demo/*.csv"))
    reports = [assess_dataset(path) for path in dataset_files]
    totals = {
        "rows_checked": sum(item["rows_checked"] for item in reports),
        "duplicate_rows": sum(item["duplicate_rows"] for item in reports),
        "missing_timestamps": sum(item["missing_timestamps"] for item in reports),
        "missing_platform": sum(item["missing_platform"] for item in reports),
        "invalid_engagement": sum(item["invalid_engagement"] for item in reports),
        "impossible_dates": sum(item["impossible_dates"] for item in reports),
        "empty_text": sum(item["empty_text"] for item in reports),
        "language_uncertainty": sum(item["language_uncertainty"] for item in reports),
        "malformed_urls": sum(item["malformed_urls"] for item in reports),
    }

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "datasets": reports,
        "totals": totals,
        "quality_status": "pass" if all(value == 0 for value in totals.values()) else "warnings",
        "note": "Sentiment represents sampled public comments and should not be interpreted as representative of the entire electorate.",
    }
    return payload


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = build_report()
    REPORT_PATH.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(payload["totals"], indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
