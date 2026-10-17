#!/usr/bin/env python3
"""Maintain the curated public catalog without reintroducing duplicate songs.

The catalog is the source of truth. Markdown files not yet listed are NOT
automatically published: a new song must be explicitly added to songs.json
after artist/title verification. This also preserves alternate arrangements.
"""
import json
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SONGS = ROOT / "songs"
CATALOG = SONGS / "songs.json"


def normalize(value):
    value = unicodedata.normalize("NFKD", str(value or ""))
    return "".join(c.lower() for c in value if not unicodedata.combining(c) and c.isalnum())


def generate():
    existing = json.loads(CATALOG.read_text(encoding="utf-8")) if CATALOG.exists() else []
    if not isinstance(existing, list):
        raise ValueError("songs/songs.json must contain an array")

    entries = []
    seen_files = set()
    seen_ids = set()
    seen_songs = set()
    removed = 0
    for entry in existing:
        if not all(entry.get(k) for k in ("id", "title", "artist", "file")):
            raise ValueError(f"Incomplete catalog entry: {entry!r}")
        file = entry["file"]
        if not (SONGS / file).is_file():
            raise ValueError(f"Catalog references missing Markdown: {file}")
        song_key = (normalize(entry["artist"]), normalize(entry["title"]))
        if file in seen_files or entry["id"] in seen_ids or song_key in seen_songs:
            removed += 1
            continue
        entries.append(entry)
        seen_files.add(file)
        seen_ids.add(entry["id"])
        seen_songs.add(song_key)

    # Never scan unlisted Markdown files. They may be duplicates, drafts,
    # or alternate versions awaiting a curated title.
    result = json.dumps(entries, ensure_ascii=False, indent=2) + "\n"
    if CATALOG.read_text(encoding="utf-8") != result:
        CATALOG.write_text(result, encoding="utf-8")
    print(f"Catalog: {len(entries)} curated entries; {removed} duplicates removed; 0 auto-imported")


if __name__ == "__main__":
    generate()
