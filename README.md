# Portail Suivis Service Électrique ELJ

Application de gestion du service électrique : équipements critiques,
pièces de rechange (PDR), achats (DA/BC), mouvements de stock,
interventions, dépenses, documents (GED), notifications, audit.

- `backend/` — API NestJS + Prisma + PostgreSQL
- `frontend/` — React (Vite) + React Query
- `docker-compose.yml` — Postgres, Redis, backend, frontend

## Démarrage rapide avec Docker

C'est le chemin recommandé : il construit les deux images, applique les
migrations et démarre toute la pile en une commande.

```bash
cp .env.example .env   # puis éditer les valeurs marquées "a_changer" / "change-me"
docker compose up --build
```

- Frontend : http://localhost:8080
- API : http://localhost:3000 (documentation Swagger sur `/api/docs`)
- Au premier démarrage, créer le compte administrateur :
  `docker compose exec backend npm run prisma:seed`
  (compte créé : `admin@sonasid-elj.local` / `ChangeMoi123!` — à changer immédiatement)

Les migrations Prisma sont appliquées automatiquement au démarrage du
conteneur backend (`docker-entrypoint.sh` → `prisma migrate deploy`). Les
documents uploadés (GED) sont persistés dans le volume Docker `uploads`,
les données PostgreSQL dans `pgdata`.

## Démarrage en local, sans Docker

```bash
# Base de données
docker compose up -d postgres redis   # ou une instance PostgreSQL/Redis locale

# Backend
cd backend
cp .env.example .env                  # adapter DATABASE_URL si besoin
npm install
npm run prisma:generate
npm run prisma:migrate                # applique backend/prisma/migrations
npm run prisma:seed                   # crée le compte admin@sonasid-elj.local
npm run start:dev                     # http://localhost:3000

# Frontend (autre terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                           # http://localhost:5173
```

## Tests

```bash
cd backend
npm test
```

## Ce qui est fonctionnel

- **Base de données** : `backend/prisma/schema.prisma` — 14 entités
  (Équipements, Articles PDR, Fournisseurs, Commandes, DA, Entrées, Sorties,
  Utilisateurs, Documents, Interventions, Dépenses, Historique,
  Notifications) + une table `Parametre` générique pour toutes les listes
  paramétrables (familles, secteurs, marques...). Migration initiale fournie
  dans `backend/prisma/migrations/`.
- **Authentification** : JWT, hash bcrypt, guard de rôles (`RolesGuard` +
  `@Roles(...)`), limitation de débit sur `/auth/login` (5 tentatives/min/IP).
- **Tous les modules métier ont un backend complet** (CRUD, recherche/
  filtre/pagination, audit) et une page frontend correspondante, y compris
  **Utilisateurs** et **Documents (GED)** :
  - **Équipements** : + duplication, import/export Excel/CSV
  - **PDR** : statut de stock toujours recalculé côté serveur, consommation
    12 mois glissants, notifications automatiques sur rupture/critique
  - **Demandes d'Achat (DA)** : import SAP avec upsert anti-doublon, délai
    DA→BC calculé
  - **Commandes (BC)** : détection automatique des retards de livraison
  - **Entrées** : incrémente automatiquement le stock PDR lié
  - **Sorties** : décrémente le stock, endpoint de retour qui réintègre
    la quantité
  - **Dépenses** : endpoint de synthèse budgétaire par secteur/type
  - **Documents (GED)** : upload, prévisualisation, suppression (stockage
    disque local, volume Docker dédié — à remplacer par Azure Blob/S3 pour
    un déploiement multi-instance)
  - **Notifications** : liste, compteur non-lu, marquage lu, génération
    automatique quotidienne (voir ci-dessous)
  - **Historique** : lecture seule de l'audit trail
  - **Fournisseurs, Paramètres, Utilisateurs** : CRUD (utilisateurs réservé
    au rôle ADMINISTRATEUR, désactivation plutôt que suppression)
  - **Interventions** : CRUD + met à jour automatiquement la date de
    dernière intervention de l'équipement concerné (même transaction)
  - **Recherche globale** (`/search?q=...`) : interroge en parallèle
    équipements, articles PDR, DA, commandes, fournisseurs et documents
  - **Rapports** : export Excel et PDF de synthèse (PDR par statut,
    dépenses par secteur, sorties en cours, DA par statut), recalculé à
    chaque téléchargement
- **Jobs planifiés** (`backend/src/notifications/notifications.cron.service.ts`,
  `@Cron` quotidien) : génère des notifications pour la maintenance
  d'équipement à venir (7 jours), les commandes en retard (30 jours sans
  réception) et les DA en attente de validation (15 jours) — sans relance
  quotidienne tant que l'alerte n'est pas retraitée.
- **Frontend** : une page par module, toutes branchées sur l'API réelle
  (aucune donnée codée en dur), avec un composant `DataTable` et `CrudModal`
  réutilisables, routing complet (`App.jsx`), écran de connexion, et menu
  adapté au rôle de l'utilisateur connecté.
- **Déploiement Docker** : `Dockerfile` multi-étapes pour le backend
  (migrations appliquées au démarrage) et pour le frontend (build Vite servi
  par nginx, URL de l'API injectée au démarrage du conteneur plutôt que figée
  au build), `docker-compose.yml` avec health checks et démarrage ordonné.

## Ce qui reste à construire

- **Assistant IA** — volontairement laissé de côté : il nécessite un choix
  produit (quel modèle, quelles actions autorisées, quel niveau
  d'autonomie) qui dépasse un pattern de code à dupliquer. À cadrer dans une
  discussion dédiée — le reste du backend expose déjà tout ce dont un
  assistant aurait besoin (endpoints REST documentés via Swagger sur
  `/api/docs`).
- **Expiration de mot de passe** — la politique de complexité est en place
  (`CreateUserDto`), l'expiration périodique ne l'est pas (nécessite un champ
  `passwordChangedAt` et une vérification au login).
- **Couverture de tests** — quelques tests unitaires de référence sont
  fournis (`AuthService`, `RolesGuard`, calcul de statut de stock PDR) ;
  à étendre module par module et à compléter avec des tests d'intégration.

## Sécurité

- Rate limiting sur `/auth/login` : en place (`@nestjs/throttler`).
- `JWT_SECRET` : à définir dans `.env` avec une vraie valeur secrète — le
  démarrage échoue volontairement si `NODE_ENV=production` et que la valeur
  par défaut est encore utilisée.
- Politique de mots de passe : longueur minimale + complexité imposées à la
  création d'un compte (`CreateUserDto`).
- Scan de sécurité des dépendances (`npm audit`, Snyk ou équivalent) : à
  intégrer dans la CI, non automatisé ici.
