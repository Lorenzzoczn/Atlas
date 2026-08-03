# syntax=docker/dockerfile:1

# ─── dependências ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── build ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* é embutido no bundle durante o build, não lido em runtime.
# Trocar a URL da API depois exige rebuild — por isso ela entra como ARG.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# `public/` pode não existir: o git não versiona diretório vazio, e hoje ela
# está vazia — o favicon é gerado por src/app/icon.svg. Sem isto o COPY do
# estágio final falha com "not found", e o erro não sugere a causa.
RUN mkdir -p public && npm run build

# ─── runtime ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache tini \
  && addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
# O output standalone já traz o server.js e só as dependências alcançáveis.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
