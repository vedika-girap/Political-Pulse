from __future__ import annotations

import csv
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from collectors.base import BaseCollector, CollectorResult


class CsvCollector(BaseCollector):
    """Production-ready CSV collector for structured social-media datasets."""

    name = "csv"
    source_type = "csv"

    def __init__(self, file_path: str | Path, **kwargs: Any):
        super().__init__(kwargs.get("root_path"))
        self.file_path = Path(file_path)

    def collect(self) -> CollectorResult:
        rows: list[dict[str, Any]] = []
        with self.file_path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                normalized = {str(key).strip(): value for key, value in row.items()}
                normalized["_source_file"] = str(self.file_path)
                rows.append(normalized)

        metadata = self.metadata_defaults(
            source_url=self.file_path.as_uri(),
            collection_method="CSV ingestion",
        )
        metadata.update(
            {
                "collection_date": datetime.now(timezone.utc).isoformat(),
                "coverage_start": None,
                "coverage_end": None,
                "source_type": "csv",
                "record_count": len(rows),
            }
        )

        return CollectorResult(rows=rows, metadata=metadata, source_name=self.file_path.name)
