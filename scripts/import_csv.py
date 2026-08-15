#!/usr/bin/env python3
"""CSV ingestion pipeline for PoliticalPulse.

This importer validates and normalizes structured social-media datasets before
persisting them to the processed-data layer. The import is rerunnable and
idempotent: unchanged source files are skipped without rewriting the processed
artifacts, while changed files trigger a fresh import cycle.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT_DIR = ROOT / "data" / "demo"
DEFAULT_OUTPUT_DIR = ROOT / "data" / "processed"
DEFAULT_STATE_FILE = DEFAULT_OUTPUT_DIR / "ingestion_state.json"

DATASET_ORDER = ["posts", "comments", "accounts", "peers"]
DATASET_FILES = {
    "posts": ["posts.csv"],
    "comments": ["comments.csv"],
    "accounts": ["accounts.csv"],
    "peers": ["peers.csv"],
}

PLATFORM_ALIASES = {
    "facebook": "Facebook",
    "fb": "Facebook",
    "instagram": "Instagram",
    "ig": "Instagram",
    "youtube": "YouTube",
    "yt": "YouTube",
    "x": "X",
    "twitter": "X",
    "threads": "Threads",
    "linkedin": "LinkedIn",
}

TOPIC_ALIASES = {
    "local governance": "Local Development",
    "local_governance": "Local Development",
    "local-development": "Local Development",
    "infrastructure": "Infrastructure",
    "education": "Education",
    "healthcare": "Healthcare",
    "agriculture": "Agriculture",
    "water": "Water",
    "electricity": "Electricity",
    "environment": "Environment",
    "employment": "Employment",
    "politics": "Politics",
    "events": "Events",
    "other": "Other",
}

SENTIMENT_ALIASES = {
    "positive": "positive",
    "neutral": "neutral",
    "negative": "negative",
    "critical": "negative",
    "mixed": "neutral",
    "uncertain": "neutral",
}

DATE_FORMATS = [
    "%Y-%m-%d",
    "%Y/%m/%d",
    "%d-%m-%Y",
    "%d/%m/%Y",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%dT%H:%M:%S%z",
    "%Y-%m-%d %H:%M:%S%z",
]


def normalize_field(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def normalize_key(key: str) -> str:
    key = key.strip().lower().replace("-", "_").replace(" ", "_")
    key = re.sub(r"[^a-z0-9_]", "", key)
    return key


def normalize_platform(value: str) -> str:
    normalized = normalize_field(value).lower()
    return PLATFORM_ALIASES.get(normalized, normalized.title())


def normalize_topic(value: str) -> str:
    normalized = normalize_field(value).lower()
    return TOPIC_ALIASES.get(normalized, normalized.title() or "Other")


def normalize_sentiment(value: str) -> str:
    normalized = normalize_field(value).lower()
    if not normalized:
        return "neutral"
    return SENTIMENT_ALIASES.get(normalized, "neutral")


def parse_int(value: Any) -> int | None:
    if value is None or normalize_field(value) == "":
        return None
    text = normalize_field(value).replace(",", "")
    if text.lower() in {"n/a", "na", "null", "none"}:
        return None
    try:
        return int(float(text))
    except ValueError:
        return None


def parse_float(value: Any) -> float | None:
    if value is None or normalize_field(value) == "":
        return None
    text = normalize_field(value).replace(",", "")
    if text.lower() in {"n/a", "na", "null", "none"}:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def normalize_iso_datetime(value: Any) -> str | None:
    text = normalize_field(value)
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).isoformat()
    except ValueError:
        pass

    for fmt in DATE_FORMATS:
        try:
            parsed = datetime.strptime(text, fmt)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed.isoformat()
        except ValueError:
            continue

    return None


def normalize_bool(value: Any) -> bool:
    text = normalize_field(value).lower()
    if text in {"true", "1", "yes", "y", "verified"}:
        return True
    if text in {"false", "0", "no", "n"}:
        return False
    return False


def canonicalize_row(raw: dict[str, Any], dataset_name: str) -> dict[str, Any]:
    row = {normalize_key(k): normalize_field(v) for k, v in raw.items()}
    if dataset_name == "posts":
        return {
            "politician_id": row.get("politician_id") or row.get("politician") or "",
            "politician_name": row.get("politician_name", ""),
            "platform": normalize_platform(row.get("platform", "")),
            "source_post_id": row.get("source_post_id") or row.get("post_id") or row.get("id") or "",
            "content_type": normalize_field(row.get("content_type") or row.get("media_type") or "text").lower() or "text",
            "title": normalize_field(row.get("title") or ""),
            "body": normalize_field(row.get("body") or row.get("text") or row.get("content") or ""),
            "url": normalize_field(row.get("url") or row.get("source_url") or ""),
            "published_at": normalize_iso_datetime(row.get("published_at") or row.get("date") or row.get("timestamp")) or "",
            "language": normalize_field(row.get("language") or "Other").title() or "Other",
            "topic": normalize_topic(row.get("topic") or row.get("theme") or "Other"),
            "sentiment": normalize_sentiment(row.get("sentiment") or row.get("tone") or "neutral"),
            "likes": parse_int(row.get("likes")) or 0,
            "comments": parse_int(row.get("comments")) or 0,
            "shares": parse_int(row.get("shares")) or 0,
            "views": parse_int(row.get("views")) or 0,
            "is_demo": normalize_bool(row.get("is_demo") or row.get("demo") or True),
        }

    if dataset_name == "comments":
        return {
            "post_source_id": row.get("post_source_id") or row.get("post_id") or row.get("source_post_id") or "",
            "platform": normalize_platform(row.get("platform", "")),
            "author_handle": normalize_field(row.get("author_handle") or row.get("author") or ""),
            "body": normalize_field(row.get("body") or row.get("text") or row.get("comment") or ""),
            "language": normalize_field(row.get("language") or "Other").title() or "Other",
            "sentiment": normalize_sentiment(row.get("sentiment") or row.get("tone") or "neutral"),
            "likes": parse_int(row.get("likes")) or 0,
            "published_at": normalize_iso_datetime(row.get("published_at") or row.get("date") or row.get("timestamp")) or "",
            "is_demo": normalize_bool(row.get("is_demo") or row.get("demo") or True),
        }

    if dataset_name == "accounts":
        return {
            "politician_name": normalize_field(row.get("politician_name") or row.get("name") or ""),
            "politician_id": row.get("politician_id") or row.get("politician") or "",
            "platform": normalize_platform(row.get("platform", "")),
            "handle": normalize_field(row.get("handle") or row.get("username") or ""),
            "display_name": normalize_field(row.get("display_name") or row.get("name") or ""),
            "account_url": normalize_field(row.get("account_url") or row.get("url") or ""),
            "follower_count": parse_int(row.get("follower_count") or row.get("followers")) or 0,
            "verified": normalize_bool(row.get("verified") or row.get("is_verified") or False),
            "is_primary": normalize_bool(row.get("is_primary") or row.get("primary") or False),
        }

    if dataset_name == "peers":
        return {
            "politician_name": normalize_field(row.get("politician_name") or row.get("selected_politician") or ""),
            "peer_name": normalize_field(row.get("peer_name") or row.get("peer") or row.get("comparison_name") or ""),
            "peer_group_name": normalize_field(row.get("peer_group_name") or row.get("group_name") or "Peer Group"),
            "peer_group_description": normalize_field(row.get("peer_group_description") or row.get("description") or ""),
        }

    return row


def required_fields_for(dataset_name: str) -> list[str]:
    if dataset_name == "posts":
        return ["politician_id", "platform", "source_post_id", "published_at", "body"]
    if dataset_name == "comments":
        return ["post_source_id", "platform", "body", "published_at"]
    if dataset_name == "accounts":
        return ["politician_name", "platform", "handle"]
    if dataset_name == "peers":
        return ["politician_name", "peer_name", "peer_group_name"]
    return []


def detect_missing_values(row: dict[str, Any], dataset_name: str) -> list[str]:
    missing = []
    for field_name in required_fields_for(dataset_name):
        if not row.get(field_name):
            missing.append(field_name)
    return missing


def duplicate_signature(row: dict[str, Any], dataset_name: str) -> str:
    if dataset_name == "posts":
        key = (
            row.get("politician_id", ""),
            row.get("platform", ""),
            row.get("source_post_id", ""),
            row.get("published_at", ""),
            row.get("body", ""),
        )
        return "|".join(str(part) for part in key)
    if dataset_name == "comments":
        key = (
            row.get("post_source_id", ""),
            row.get("platform", ""),
            row.get("author_handle", ""),
            row.get("published_at", ""),
            row.get("body", ""),
        )
        return "|".join(str(part) for part in key)
    if dataset_name == "accounts":
        key = (row.get("politician_name", ""), row.get("platform", ""), row.get("handle", ""))
        return "|".join(str(part) for part in key)
    if dataset_name == "peers":
        key = (row.get("politician_name", ""), row.get("peer_name", ""), row.get("peer_group_name", ""))
        return "|".join(str(part) for part in key)
    return json.dumps(row, sort_keys=True)


def read_csv_rows(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            return []
        return [dict(row) for row in reader]


def file_fingerprint(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_state(state_file: Path) -> dict[str, Any]:
    if not state_file.exists():
        return {"files": {}}
    try:
        with state_file.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
        if isinstance(data, dict) and isinstance(data.get("files"), dict):
            return data
    except json.JSONDecodeError:
        pass
    return {"files": {}}


def save_state(state_file: Path, state: dict[str, Any]) -> None:
    state_file.parent.mkdir(parents=True, exist_ok=True)
    with state_file.open("w", encoding="utf-8") as handle:
        json.dump(state, handle, indent=2, sort_keys=True)
        handle.write("\n")


def write_json_file(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, sort_keys=True)
        handle.write("\n")


def process_dataset(dataset_name: str, input_dir: Path, output_dir: Path, state: dict[str, Any]) -> dict[str, Any]:
    input_file = input_dir / f"{dataset_name}.csv"
    if not input_file.exists():
        return {
            "dataset": dataset_name,
            "status": "skipped",
            "reason": "input file not found",
            "rows_received": 0,
            "rows_accepted": 0,
            "rows_rejected": 0,
            "duplicates": 0,
            "missing_values": 0,
            "invalid_metrics": 0,
        }

    fingerprint = file_fingerprint(input_file)
    if state["files"].get(dataset_name) == fingerprint:
        return {
            "dataset": dataset_name,
            "status": "idempotent_skip",
            "reason": "file unchanged since last import",
            "rows_received": 0,
            "rows_accepted": 0,
            "rows_rejected": 0,
            "duplicates": 0,
            "missing_values": 0,
            "invalid_metrics": 0,
        }

    rows = read_csv_rows(input_file)
    normalized_rows: list[dict[str, Any]] = []
    seen_signatures: set[str] = set()
    rows_received = len(rows)
    rows_accepted = 0
    rows_rejected = 0
    duplicates = 0
    missing_values = 0
    invalid_metrics = 0

    for raw_row in rows:
        row = canonicalize_row(raw_row, dataset_name)
        missing = detect_missing_values(row, dataset_name)
        if missing:
            rows_rejected += 1
            missing_values += len(missing)
            continue

        signature = duplicate_signature(row, dataset_name)
        if signature in seen_signatures:
            rows_rejected += 1
            duplicates += 1
            continue
        seen_signatures.add(signature)

        if dataset_name == "posts":
            if row.get("published_at") == "":
                rows_rejected += 1
                missing_values += 1
                continue
            if row["likes"] is None or row["comments"] is None or row["shares"] is None:
                rows_rejected += 1
                invalid_metrics += 1
                continue
        elif dataset_name == "comments":
            if row.get("published_at") == "":
                rows_rejected += 1
                missing_values += 1
                continue
            if row["likes"] is None:
                rows_rejected += 1
                invalid_metrics += 1
                continue
        elif dataset_name == "accounts":
            if row.get("follower_count") is None:
                rows_rejected += 1
                invalid_metrics += 1
                continue

        normalized_rows.append(row)
        rows_accepted += 1

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{dataset_name}.normalized.json"
    write_json_file(output_path, normalized_rows)

    report = {
        "dataset": dataset_name,
        "source_file": str(input_file),
        "rows_received": rows_received,
        "rows_accepted": rows_accepted,
        "rows_rejected": rows_rejected,
        "duplicates": duplicates,
        "missing_values": missing_values,
        "invalid_metrics": invalid_metrics,
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "status": "success",
    }
    write_json_file(output_dir / f"{dataset_name}.report.json", report)

    state["files"][dataset_name] = fingerprint
    return report


def build_summary_report(dataset_reports: list[dict[str, Any]]) -> dict[str, Any]:
    totals = {
        "rows_received": 0,
        "rows_accepted": 0,
        "rows_rejected": 0,
        "duplicates": 0,
        "missing_values": 0,
        "invalid_metrics": 0,
    }
    for report in dataset_reports:
        for key in totals:
            totals[key] += int(report.get(key, 0))

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "datasets": dataset_reports,
        "totals": totals,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import CSV fixtures into the PoliticalPulse processed-data layer.")
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT_DIR, help="Directory containing the CSV sources.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR, help="Directory for the normalized JSON and reports.")
    parser.add_argument("--state-file", type=Path, default=DEFAULT_STATE_FILE, help="Stores source fingerprints for idempotent reruns.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    input_dir = args.input_dir.resolve()
    output_dir = args.output_dir.resolve()
    state_file = args.state_file.resolve()

    state = load_state(state_file)
    dataset_reports: list[dict[str, Any]] = []

    for dataset_name in DATASET_ORDER:
        report = process_dataset(dataset_name, input_dir, output_dir, state)
        dataset_reports.append(report)

    summary = build_summary_report(dataset_reports)
    write_json_file(output_dir / "import_summary.json", summary)
    save_state(state_file, state)

    print(json.dumps(summary["totals"], indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
