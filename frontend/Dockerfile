# ---- Étape de build : compilation des assets statiques ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Image d'exécution : nginx sert les fichiers statiques ----
FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exécuté automatiquement par l'image nginx officielle au démarrage du
# conteneur, avant nginx : régénère env-config.js avec l'URL réelle de
# l'API pour cet environnement (VITE_API_URL est figé au build par Vite,
# donc on ne peut pas s'appuyer dessus au runtime).
COPY docker-entrypoint.d/40-env-config.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
