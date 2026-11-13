#!/usr/bin/env python3
"""Bundle the exact offline web build; --check never writes and rejects stale resources."""
import argparse
import hashlib
import json
import re
import struct
import sys
from html.parser import HTMLParser
from pathlib import Path


class AssetReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag in {"script", "img", "iframe", "audio", "video", "source", "embed"}:
            for key in ("src", "srcset", "poster"):
                if attributes.get(key):
                    self.references.append(attributes[key])
        if tag == "link" and attributes.get("href"):
            self.references.append(attributes["href"])
        if tag == "object" and attributes.get("data"):
            self.references.append(attributes["data"])


def validate_html(data):
    text = data.decode("utf-8")
    if "/*THREE*/" in text or "/*GAME*/" in text or "<!--APPMETA-->" in text:
        raise ValueError("Unresolved build placeholder in offline HTML")
    parser = AssetReferences()
    parser.feed(text)
    refs = parser.references + re.findall(r"url\(\s*['\"]?([^\s)'\"]+)", text)
    unexpected = [ref for ref in refs if not ref.startswith(("data:", "#"))]
    if unexpected:
        raise ValueError("Offline bundle contains external/separate assets: " + repr(unexpected[:5]))
    if re.search(r"@import\s", text, re.I):
        raise ValueError("CSS @import is not allowed in the standalone bundle")
    version = re.search(r"VERSIONE\s+(\d+(?:\.\d+)+)", text)
    if not version:
        raise ValueError("Visible game version missing")
    return version.group(1)


def validate_icon(path):
    data = path.read_bytes()
    if len(data) < 33 or data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise ValueError("AppIcon.png is not a PNG")
    width, height, depth, colour = struct.unpack(">IIBB", data[16:26])
    if (width, height, depth, colour) != (1024, 1024, 8, 2):
        raise ValueError("AppIcon.png must be opaque 1024x1024 RGB, 8-bit")
    offset = 8
    while offset + 12 <= len(data):
        size = struct.unpack(">I", data[offset:offset + 4])[0]
        chunk = data[offset + 4:offset + 8]
        if chunk == b"tRNS":
            raise ValueError("AppIcon.png must not contain transparency")
        offset += size + 12
        if chunk == b"IEND":
            return
    raise ValueError("Truncated AppIcon.png")


def expected_resources(root):
    source = root / "motore/dist/index.html"
    html = source.read_bytes()
    version = validate_html(html)
    license_data = (root / "motore/node_modules/three/LICENSE").read_bytes()
    manifest = {
        "formatVersion": 1,
        "gameVersion": version,
        "source": "motore/dist/index.html",
        "sha256": hashlib.sha256(html).hexdigest(),
        "thirdParty": {"three": "0.128.0", "licenseSHA256": hashlib.sha256(license_data).hexdigest()},
    }
    return {
        "index.html": html,
        "THREE-LICENSE.txt": license_data,
        "bundle-manifest.json": (json.dumps(manifest, indent=2, sort_keys=True) + "\n").encode(),
    }


def sync(root, check=False):
    expected = expected_resources(root)
    validate_icon(root / "ios/DITE/Assets.xcassets/AppIcon.appiconset/AppIcon.png")
    target = root / "ios/DITE/Resources/Game"
    if check:
        stale = [name for name, data in expected.items() if not (target / name).is_file() or (target / name).read_bytes() != data]
        extra = sorted(path.name for path in target.iterdir() if path.name not in expected) if target.exists() else []
        if stale or extra:
            raise ValueError("iOS bundle is stale; run python3 scripts/ios_sync.py (changed: " + ", ".join(stale + extra) + ")")
    else:
        target.mkdir(parents=True, exist_ok=True)
        unexpected = [path for path in target.iterdir() if path.name not in expected]
        if unexpected:
            raise ValueError("Unexpected resources; inspect before replacing: " + ", ".join(path.name for path in unexpected))
        for name, data in expected.items():
            path = target / name
            if not path.exists() or path.read_bytes() != data:
                temporary = path.with_suffix(path.suffix + ".tmp")
                temporary.write_bytes(data)
                temporary.replace(path)
    manifest = json.loads(expected["bundle-manifest.json"])
    print(f"iOS offline bundle {'checked' if check else 'synced'}: DITE {manifest['gameVersion']}, SHA256 {manifest['sha256']}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail on missing/stale resources without changing anything")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1], help=argparse.SUPPRESS)
    args = parser.parse_args()
    try:
        sync(args.root, args.check)
    except (OSError, ValueError, UnicodeError) as error:
        print(f"iOS bundle error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
