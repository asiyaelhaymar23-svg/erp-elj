#!/bin/sh
set -e

echo "Application des migrations Prisma..."
npx prisma migrate deploy

# Idempotent (upsert sur l'email) : sûr à rejouer à chaque démarrage.
# Nécessaire sur les plateformes sans accès shell (ex. Render, plan gratuit)
# où il n'y a pas d'autre façon de lancer la commande une seule fois.
echo "Vérification du compte administrateur..."
npm run prisma:seed

exec "$@"
