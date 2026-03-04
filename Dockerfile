# Stage 1: build
FROM node:24.14.0 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
RUN npm prune --omit=dev --legacy-peer-deps

# Stage 2: run
FROM node:24.14.0
RUN npm install pm2 -g
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY .env.example ./.env.example
ENV PORT=3000
EXPOSE 3000
CMD ["pm2-runtime", "start", "dist/main.js", "--name", "api"]
