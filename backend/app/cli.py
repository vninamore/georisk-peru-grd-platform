"""Small operational CLI for local demonstrations."""

import argparse
import json

from app.demo_data import build_demo_feature_collection


def main() -> None:
    parser = argparse.ArgumentParser(description="GeoRisk Peru operations")
    parser.add_argument("command", choices=["demo"], help="Operation to execute")
    args = parser.parse_args()
    if args.command == "demo":
        print(json.dumps(build_demo_feature_collection(), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
