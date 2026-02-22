"""
Load SUBTLEX-US word frequency data.
Expects space-separated file with header: Word FREQcount CDcount FREQlow Cdlow SUBTLWF Lg10WF SUBTLCD Lg10CD
See: https://openlexicon.fr/datasets-info/SUBTLEX-US/README-SUBTLEXus.html
"""
import os
import urllib.request
from pathlib import Path

# Data dir: SUBTLEX_PATH env (e.g. /data in Docker) or ./data next to this file
SUBTLEX_FILENAME = "SUBTLEXus74286wordstextversion.txt"
DATA_DIR = (
    Path(os.environ["SUBTLEX_PATH"])
    if os.environ.get("SUBTLEX_PATH")
    else Path(__file__).resolve().parent / "data"
)
SUBTLEX_URL = (
    "https://raw.githubusercontent.com/cltl/python-for-text-analysis/"
    "master/Data/SUBTLEX-US/SUBTLEXus74286wordstextversion.txt"
)


def _parse_line(line: str) -> tuple[str, float, float] | None:
    parts = line.strip().split()
    if len(parts) < 6:
        return None
    try:
        word = parts[0]
        freq_count = float(parts[1])  # FREQcount
        subtlwf = float(parts[5])    # SUBTLWF = frequency per million
        return (word.lower(), freq_count, subtlwf)
    except (ValueError, IndexError):
        return None


def load_subtlex(filepath: str | Path | None = None) -> dict[str, dict]:
    """
    Load SUBTLEX data from file. Returns dict: word_lower -> { "freq_count", "freq_per_million" }.
    If filepath is None, uses DATA_DIR/SUBTLEX_FILENAME. If file does not exist, returns {}.
    """
    if filepath is None:
        filepath = DATA_DIR / SUBTLEX_FILENAME
    filepath = Path(filepath)
    if not filepath.is_file():
        return {}

    out: dict[str, dict] = {}
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        for i, line in enumerate(f):
            if i == 0 and line.strip().startswith("Word"):
                continue  # skip header
            row = _parse_line(line)
            if row:
                w, freq_count, subtlwf = row
                # keep first occurrence (higher freq) for case variants
                if w not in out:
                    out[w] = {"freq_count": freq_count, "freq_per_million": subtlwf}
    return out


def ensure_subtlex_downloaded() -> Path:
    """Download SUBTLEX file to DATA_DIR if not present. Returns path to file."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    dest = DATA_DIR / SUBTLEX_FILENAME
    if dest.is_file():
        return dest
    try:
        urllib.request.urlretrieve(SUBTLEX_URL, dest)
    except Exception:
        pass
    return dest


# Module-level cache
_subtlex_cache: dict[str, dict] | None = None


def get_subtlex_store() -> dict[str, dict]:
    global _subtlex_cache
    if _subtlex_cache is None:
        ensure_subtlex_downloaded()
        _subtlex_cache = load_subtlex()
    return _subtlex_cache


def get_frequency(word: str) -> dict | None:
    """Return frequency info for word (lowercased) or None if not in SUBTLEX."""
    store = get_subtlex_store()
    return store.get(word.lower()) if store else None
