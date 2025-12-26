FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY src ./src
COPY build.mjs ./
RUN bun run build.mjs

COPY index.ts .
COPY index.html .
COPY public /app/public
EXPOSE 3000

CMD ["bun", "run", "index.ts"]
