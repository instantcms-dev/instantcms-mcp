# syntax=docker/dockerfile:1
# Multi-stage образ MCP-сервера InstantCMS.
# Режим по умолчанию — HTTP (--http); порт — CMD/MCP_HTTP_PORT (по умолчанию 3001).
# Для stdio-режима: `docker run ... instantcms-mcp node dist/index.js`.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm ci --ignore-scripts && npm run build

FROM node:22-alpine
LABEL org.opencontainers.image.source=https://github.com/instantcms-dev/instantcms-mcp
LABEL org.opencontainers.image.description="MCP server for InstantCMS 2 development"
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY --from=build /app/dist ./dist
# Зависимости только рантайма: чистая установка без dev-пакетов и скриптов.
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
RUN addgroup -S mcp && adduser -S mcp -G mcp
USER mcp

# В контейнере сервер обязан слушать все интерфейсы: иначе Docker не может
# доставить трафик с опубликованного порта (внутри остаётся 127.0.0.1-привязка,
# а HEALTHCHECK ходит на loopback и потому не ловит проблему).
ENV MCP_HTTP_HOST=0.0.0.0
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.MCP_HTTP_PORT||3001)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Порт задаётся CMD или переменной MCP_HTTP_PORT; HOST — MCP_HTTP_HOST.
ENTRYPOINT ["node", "dist/index.js", "--http"]
CMD ["--port", "3001"]
