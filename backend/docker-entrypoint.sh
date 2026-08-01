#!/bin/sh
set -e

echo "Application des migrations Prisma..."
npx prisma migrate deploy

# Idempotent (upsert sur l'email) : sûr à rejouer à chaque démarrage.
# Nécessaire sur les plateformes sans accès shell (ex. Render, plan gratuit)
# où il n'y a pas d'autre façon de lancer la commande une seule fois.
# Borné dans le temps et non bloquant : c'est une commodité, pas une
# condition pour que l'API démarre — un plan gratuit à CPU très limité ne
# doit jamais empêcher le port de s'ouvrir (voir prisma:seed qui utilise
# --transpile-only pour rester rapide en toute circonstance).
echo "Vérification du compte administrateur..."
timeout 60 npm run prisma:seed || echo "Seed ignoré (échec ou délai dépassé) — l'API démarre quand même."

exec "$@"
