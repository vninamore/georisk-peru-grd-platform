"""Generate deterministic synthetic portfolio data.

This script deliberately avoids real or sensitive locations. Coordinates are
offset demonstration points and must never be interpreted as official GRD data.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "sample"

ROWS = [
    (
        "LIM-DEMO-001",
        "Sector Ribereño Norte",
        -76.945,
        -12.025,
        "flood",
        0.88,
        0.84,
        0.82,
        0.70,
        0.62,
        0.55,
    ),
    (
        "LIM-DEMO-002",
        "Ladera Este",
        -76.905,
        -12.075,
        "landslide",
        0.78,
        0.65,
        0.76,
        0.66,
        0.58,
        0.71,
    ),
    (
        "LIM-DEMO-003",
        "Centro Urbano",
        -77.035,
        -12.055,
        "earthquake",
        0.67,
        0.92,
        0.60,
        0.48,
        0.45,
        0.30,
    ),
    (
        "LIM-DEMO-004",
        "Interfaz Urbano-Forestal",
        -76.870,
        -12.110,
        "wildfire",
        0.51,
        0.38,
        0.48,
        0.40,
        0.32,
        0.74,
    ),
    (
        "LIM-DEMO-005",
        "Zona Consolidada Oeste",
        -77.105,
        -12.095,
        "earthquake",
        0.45,
        0.52,
        0.34,
        0.29,
        0.25,
        0.18,
    ),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    headers = [
        "unit_id",
        "name",
        "longitude",
        "latitude",
        "hazard_type",
        "hazard",
        "exposure",
        "physical",
        "social",
        "economic",
        "environmental",
    ]
    with (OUT / "vulnerability_indicators.csv").open(
        "w", newline="", encoding="utf-8"
    ) as handle:
        writer = csv.writer(handle)
        writer.writerow(headers)
        writer.writerows(ROWS)

    features = []
    for row in ROWS:
        values = dict(zip(headers, row, strict=True))
        features.append(
            {
                "type": "Feature",
                "id": values["unit_id"],
                "geometry": {
                    "type": "Point",
                    "coordinates": [values.pop("longitude"), values.pop("latitude")],
                },
                "properties": values,
            }
        )
    collection = {
        "type": "FeatureCollection",
        "name": "synthetic_multihazard_inputs",
        "metadata": {
            "crs": "EPSG:4326",
            "license": "CC0-1.0",
            "disclaimer": "Synthetic demonstration data; not official.",
        },
        "features": features,
    }
    (OUT / "risk_scenarios.geojson").write_text(
        json.dumps(collection, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
