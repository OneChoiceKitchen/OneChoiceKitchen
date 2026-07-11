FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
ARG NX_PROJECT=admin-portal
RUN npx nx build ${NX_PROJECT}

FROM nginx:alpine AS production

ARG DIST_PATH=dist/apps/admin/admin-portal
COPY --from=build /app/${DIST_PATH} /usr/share/nginx/html
COPY infra/nginx/portal.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
