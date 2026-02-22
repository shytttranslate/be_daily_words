# Word Difficulty API (CEFR + SUBTLEX)

- **CEFR**: [cefrpy](https://pypi.org/project/cefrpy/) — difficulty level (A1–C2) for English words.
- **SUBTLEX**: [SUBTLEX-US](https://openlexicon.fr/datasets-info/SUBTLEX-US/README-SUBTLEXus.html) — word frequency from film/TV subtitles.

## Endpoints

- `GET /word/{word}` — returns `cefr_level`, `cefr_level_float`, `frequency` (raw count), `freq_per_million`.
- `GET /health` — health check.

## Run locally (optional)

```bash
# From repo root; ensure SUBTLEX is in word_difficulty/data/ or it will be downloaded
pip install -r word_difficulty/requirements.txt
PYTHONPATH=. uvicorn word_difficulty.main:app --host 0.0.0.0 --port 8000
```

In production, the same service runs inside the main Docker container (port 8000 internal); NestJS proxies via `GET /api/mail/word/:word`.
