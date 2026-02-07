FROM node:22-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
# Force rebuild - listen on 0.0.0.0 for Docker
RUN rm -rf dist && npx tsc -p tsconfig.prod.json && echo "Build success" && ls dist/main.js

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
