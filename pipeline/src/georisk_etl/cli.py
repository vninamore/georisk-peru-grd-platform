"""Command-line quality gate for GeoJSON inputs."""

import argparse
import json
from dataclasses import asdict
from pathlib import Path

from georisk_etl.quality import validate_feature_collection


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate GeoRisk GeoJSON inputs")
    parser.add_argument("input", type=Path)
    args = parser.parse_args()
    document = json.loads(args.input.read_text(encoding="utf-8"))
    report = validate_feature_collection(document)
    print(
        json.dumps(
            {
                "passed": report.passed,
                "feature_count": report.feature_count,
                "valid_feature_count": report.valid_feature_count,
                "completeness": report.completeness,
                "issues": [asdict(issue) for issue in report.issues],
            },
            indent=2,
        )
    )
    raise SystemExit(0 if report.passed else 1)


if __name__ == "__main__":
    main()
