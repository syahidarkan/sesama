FROM node:22-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.prod.json ./
COPY nest-cli.json ./
COPY src ./src

RUN rm -rf dist && npx tsc -p tsconfig.prod.json && ls dist/main.js

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
