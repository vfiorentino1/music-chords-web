#!/usr/bin/env python3
"""Regenerate the public song catalog from Markdown files.

Existing catalog entries retain their curated title, artist, key and id.
New files are discovered recursively under songs/ and added automatically.
"""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SONGS = ROOT / "songs"
CATALOG = SONGS / "songs.json"

def slug(value):
    value = unicodedata.normalize("NFKD", value)
    value = "".join(c for c in value if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")

def titleize(value):
    return value.replace("-", " ").replace("_", " ").strip().capitalize()

def make_artist(folder):
    overrides = {"bersuit": "Bersuit Vergarabat", "calamaro": "Andrés Calamaro",
                 "redondos": "Patricio Rey y sus Redonditos de Ricota",
                 "rhcp": "Red Hot Chili Peppers", "ntvg": "No Te Va Gustar"}
    return overrides.get(folder.lower(), titleize(folder))

def generate():
    existing = json.loads(CATALOG.read_text(encoding="utf-8")) if CATALOG.exists() else []
    entries = list(existing)
    seen_files = {e["file"] for e in entries}
    used_ids = {e["id"] for e in entries}
    for path in sorted(SONGS.rglob("*.md")):
        rel = path.relative_to(SONGS).as_posix()
        if rel in seen_files:
            continue
        stem = path.stem
        parts = path.relative_to(SONGS).parts
        artist = make_artist(parts[-2]) if len(parts) > 1 else "Sin clasificar"
        song_stem = stem
        if len(parts) > 1:
            prefix = parts[-2] + "-"
            if stem.startswith(prefix):
                song_stem = stem[len(prefix):]
        title = titleize(song_stem)
        identifier = slug(str(path.relative_to(SONGS).with_suffix("")))
        base = identifier
        counter = 2
        while identifier in used_ids:
            identifier = f"{base}-{counter}"
            counter += 1
        entries.append({"id": identifier, "title": title, "artist": artist, "file": rel})
        used_ids.add(identifier)
        seen_files.add(rel)
    # Keep curated entries intact; only add missing Markdown files.
    result = json.dumps(entries, ensure_ascii=False, indent=2) + "\n"
    CATALOG.write_text(result, encoding="utf-8")
    print(f"Catalog: {len(entries)} entries, {len(entries) - len(existing)} added")

if __name__ == "__main__":
    generate()
