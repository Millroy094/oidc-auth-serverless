FROM node:22-alpine3.20 AS builder

WORKDIR /build

COPY . .

RUN npm install -g pnpm &&\
    pnpm install &&\
    pnpm run --filter=@oauth-server/frontend build &&\
    pnpm run --filter=@oauth-server/backend build &&\
    pnpm run --filter=@oauth-server/backend generateJwks

FROM node:22-alpine3.20 AS app

WORKDIR /app

COPY --from=builder /build/packages/backend/build /app
COPY --from=builder /build/packages/backend/keys.json /app
COPY  --from=builder /build/packages/backend/package.json /app
COPY  --from=builder /build/packages/backend/package-lock.json /app
COPY  --from=builder /build/packages/backend/pm2-process.yml /app
COPY  --from=builder /build/packages/backend/certs /app/certs
COPY  --from=builder /build/packages/frontend/dist /app/public

RUN npm ci --production && npm install -g pm2

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start"]







