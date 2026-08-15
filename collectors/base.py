from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class CollectorResult:
    rows: list[dict[str, Any]] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    source_name: str = ""


class BaseCollector(ABC):
    """Base abstraction for social-media data collectors.

    All collectors should return parsed rows plus a metadata object containing
    provenance details such as source URL, coverage period, method, and data
    collection date. This abstraction keeps platform-specific implementations
    isolated while the rest of the system consumes a uniform row format.
    """

    name: str = "base"
    source_type: str = "unknown"

    def __init__(self, root_path: str | Path | None = None):
        self.root_path = Path(root_path) if root_path is not None else Path.cwd()

    @abstractmethod
    def collect(self) -> CollectorResult:
        raise NotImplementedError

    def metadata_defaults(self, *, source_url: str | None = None, collection_method: str | None = None) -> dict[str, Any]:
        return {
            "source_url": source_url,
            "collection_method": collection_method or self.source_type,
            "collection_date": None,
            "coverage_start": None,
            "coverage_end": None,
            "limitations": [
                "Public, non-private data only.",
                "Data quality should be validated before analysis.",
                "Coverage and source constraints must be documented before interpretation.",
            ],
        }
