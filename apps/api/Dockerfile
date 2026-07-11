FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx nx build api

FROM node:20-alpine AS production

WORKDIR /app
COPY --from=build /app/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/api/public ./public
COPY --from=build /app/api/dev.db ./dev.db

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
WORKDIR /app/dist
CMD ["node", "main.js"]
