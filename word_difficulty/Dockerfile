# Container chứa toàn bộ chức năng phân độ khó từ (CEFR + SUBTLEX)
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY app.py subtlex_loader.py ./

# SUBTLEX data: mount volume at /data hoặc copy file vào /data
RUN mkdir -p /data
ENV SUBTLEX_PATH=/data
ENV PORT=8000
EXPOSE 8000

# Production server (Flask is WSGI → use gunicorn)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "1", "app:app"]
