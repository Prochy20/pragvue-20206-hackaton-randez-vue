# Production image: Nuxt build output plus the SQL migrations the server applies on start.
FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@12.6.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# postinstall (nuxt prepare) needs the sources; nuxt build prepares on its own.
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
COPY --from=build /app/.output ./.output
# Migrations are read from server/db/migrations relative to the working directory.
COPY --from=build /app/server/db/migrations ./server/db/migrations
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
