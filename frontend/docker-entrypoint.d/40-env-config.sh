#!/bin/sh
set -e

# VITE_API_URL peut être un nom d'hôte nu (ex. Render `fromService:
# property: host`, qui ne fournit jamais de schéma) : on ajoute https://
# par défaut plutôt que de laisser axios pointer vers une URL invalide.
API_URL="${VITE_API_URL:-}"
case "$API_URL" in
  ""|http://*|https://*) ;;
  *) API_URL="https://${API_URL}" ;;
esac

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__ENV__ = {
  VITE_API_URL: "${API_URL}"
};
EOF
