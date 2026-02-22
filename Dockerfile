# Single container: NestJS API + Python word-difficulty (cefrpy + SUBTLEX)
FROM node:20-bookworm-slim AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Final image: Node + Python
FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# NestJS
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=node-builder /app/dist ./dist

# Python word_difficulty (cefrpy + SUBTLEX)
COPY word_difficulty ./word_difficulty
RUN pip3 install --no-cache-dir -r word_difficulty/requirements.txt

# Download SUBTLEX-US at build time (optional; can also mount at runtime)
RUN python3 -c "\
from word_difficulty.subtlex_loader import ensure_subtlex_downloaded; \
ensure_subtlex_downloaded(); \
print('SUBTLEX ready'); \
" 2>/dev/null || true

COPY scripts/start.sh /app/scripts/start.sh
RUN chmod +x /app/scripts/start.sh

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
EXPOSE 8000

# Run both: Python on 8000, NestJS on 3000
CMD ["/app/scripts/start.sh"]
