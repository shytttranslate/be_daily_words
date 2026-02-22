"""
Word difficulty API: CEFR level (cefrpy) + SUBTLEX frequency.
Run: uvicorn word_difficulty.main:app --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from cefrpy import CEFRAnalyzer
except ImportError:
    CEFRAnalyzer = None

from word_difficulty.subtlex_loader import get_frequency, get_subtlex_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Preload SUBTLEX on startup
    get_subtlex_store()
    yield


app = FastAPI(title="Word Difficulty API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_cefr_levels(word: str) -> tuple[str | None, float | None]:
    """Return (cefr_level_str, cefr_level_float) e.g. ('B2', 4.0)."""
    if CEFRAnalyzer is None:
        return (None, None)
    try:
        analyzer = CEFRAnalyzer()
        level_float = analyzer.get_average_word_level_float(word)
        level_cefr = analyzer.get_average_word_level_CEFR(word)
        return (level_cefr, level_float)
    except Exception:
        return (None, None)


@app.get("/word/{word}", response_model=dict)
def word_difficulty(word: str):
    """Return CEFR difficulty and SUBTLEX frequency for the given word."""
    word = (word or "").strip()
    if not word:
        return {
            "word": "",
            "cefr_level": None,
            "cefr_level_float": None,
            "frequency": None,
            "freq_per_million": None,
            "cefr_error": None,
        }

    cefr_str, cefr_float = get_cefr_levels(word)
    freq_info = get_frequency(word)

    return {
        "word": word,
        "cefr_level": cefr_str,
        "cefr_level_float": cefr_float,
        "frequency": freq_info["freq_count"] if freq_info else None,
        "freq_per_million": freq_info["freq_per_million"] if freq_info else None,
        "cefr_error": None,
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "word-difficulty"}
