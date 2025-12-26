FROM oven/bun:1 AS base
WORKDIR /app

COPY index.ts .
COPY index.html .

EXPOSE 3000

CMD ["bun", "run", "index.ts"]
