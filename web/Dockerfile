# Next.js 用のビルドステージ
FROM node:20-alpine AS builder
WORKDIR /app

COPY .env .env

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 本番用の軽量イメージ
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]
