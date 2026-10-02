FROM node:26-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# VITE_API_URL é público (embutido no bundle); nunca passe secrets como build-arg.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build


# Imagem sem root: o processo roda como "nginx" e escuta na 8080.
FROM nginxinc/nginx-unprivileged:alpine

# A imagem base pode demorar a incorporar correções de pacotes Alpine já publicadas (ex.: o pcre2
# 10.48 -> 10.49 do CVE-2026-103111, que o Trivy barra na publicação). Atualiza os pacotes no
# build. O processo roda como "nginx" (não root): troca para root só para o apk e volta.
USER root
RUN apk upgrade --no-cache
USER nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
