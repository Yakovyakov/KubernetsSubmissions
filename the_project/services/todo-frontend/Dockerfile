FROM node:20 AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm ci

COPY . .
RUN npm run build

# Fase de producción
FROM nginx:alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

