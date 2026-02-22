#!/bin/sh
set -e
# Start Python word-difficulty API in background (port 8000)
uvicorn word_difficulty.main:app --host 0.0.0.0 --port 8000 &
# Start NestJS (port 3000)
exec node dist/main.js
