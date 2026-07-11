FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx nx build web

FROM nginx:alpine AS production

COPY --from=build /app/dist/apps/web /usr/share/nginx/html
COPY ./apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
