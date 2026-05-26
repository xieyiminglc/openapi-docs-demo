"""Export FastAPI's OpenAPI spec as JSON or YAML."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .main import app


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--format", choices=["json", "yaml"], default="yaml")
    parser.add_argument("--output", "-o", type=Path, help="Write to file instead of stdout")
    args = parser.parse_args()

    spec = app.openapi()

    if args.format == "yaml":
        try:
            import yaml
        except ImportError:
            sys.exit("PyYAML is required for --format yaml. Run: pip install pyyaml")
        text = yaml.safe_dump(spec, sort_keys=False, allow_unicode=True)
    else:
        text = json.dumps(spec, indent=2, ensure_ascii=False)

    if args.output:
        args.output.write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text)


if __name__ == "__main__":
    main()
