FROM oven/bun:alpine AS deps
WORKDIR /app
COPY . .
RUN bun install --registry=https://registry.npmmirror.com

FROM oven/bun:alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next  ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["bun", "run", "start"]
