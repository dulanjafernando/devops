FROM node:22-alpine AS builder

WORKDIR /app

RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set legacy-peer-deps true

COPY package*.json ./

RUN npm ci --prefer-offline --no-audit --no-fund

COPY . .

RUN npm run build

FROM nginx:stable-alpine

RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]