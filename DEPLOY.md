# Déployer sur Render

Ce dépôt contient un fichier `render.yaml` (Blueprint) qui décrit toute la
pile — base de données, API, frontend — pour que Render la crée en une
fois, URLs publiques déjà renseignées entre les deux services (backend et
frontend se pointent l'un vers l'autre via `https://<nom-du-service>.onrender.com`).
Si tu renommes un des deux services dans `render.yaml`, mets à jour
`VITE_API_URL` et `CORS_ORIGIN` en conséquence dans le même fichier.

## 1. Créer un compte Render

Aller sur [render.com](https://render.com) et créer un compte (le plus
simple est de se connecter avec le compte GitHub qui héberge ce dépôt —
Render demandera alors l'autorisation d'accéder à tes dépôts).

## 2. Créer le Blueprint

1. Dans le dashboard Render, cliquer **New +** → **Blueprint**.
2. Choisir le dépôt `erp-elj` dans la liste (l'installer sur ce dépôt si
   Render le demande).
3. Choisir la branche `claude/artifact-standalone-webpage-sr2g38` (ou
   `main` si tu as fusionné entre-temps).
4. Render détecte `render.yaml` à la racine et affiche les 3 ressources
   qu'il va créer : `erp-elj-db` (PostgreSQL), `erp-elj-backend`, `erp-elj-frontend`.
5. Cliquer **Apply** (ou **Create New Resources**).

Render construit les deux images Docker et provisionne la base — compte
5 à 10 minutes pour le premier déploiement. Chaque service a sa propre
page de logs dans le dashboard : c'est là qu'il faut regarder si quelque
chose ne démarre pas.

## 3. Récupérer l'URL

Une fois `erp-elj-frontend` passé au statut **Live**, son URL est affichée
en haut de sa page dans le dashboard — de la forme
`https://erp-elj-frontend.onrender.com`. C'est l'URL à partager /
utiliser dans un navigateur.

## 4. Se connecter

Au premier démarrage, le backend crée automatiquement un compte
administrateur (`docker-entrypoint.sh` exécute la migration puis le seed,
qui est sûr à rejouer) :

- Email : `admin@sonasid-elj.local`
- Mot de passe : `ChangeMoi123!`

**Change ce mot de passe immédiatement** une fois connecté (pas encore
d'écran dédié dans l'interface — passe par `PATCH /users/:id` via
`/api/docs` sur l'URL du backend, ou attends un module de profil).

## Limites du plan gratuit à connaître

- **Mise en veille** : un service web gratuit s'endort après 15 minutes
  sans trafic. La requête suivante le réveille mais prend 30 à 60
  secondes le temps du redémarrage — normal, pas une panne.
- **Documents non persistants** : les fichiers uploadés (module GED) sont
  stockés sur le disque du conteneur backend, qui est **éphémère** sur le
  plan gratuit (pas de disque persistant attachable). Un redéploiement ou
  redémarrage efface les documents déjà envoyés. Pour un usage réel,
  attacher un Disque Render (payant) monté sur `/app/uploads`, ou
  remplacer le stockage local par Azure Blob / S3 comme le note le README.
- **Base de données gratuite** : vérifier dans le dashboard Render les
  conditions actuelles du plan gratuit PostgreSQL (durée, limite de
  taille) au moment de la création — Render les fait évoluer.

## Si le Blueprint échoue à se créer automatiquement

Si Render refuse de créer les 3 ressources d'un coup :

1. Créer les 3 ressources manuellement dans le dashboard (**New +** →
   **PostgreSQL**, puis **New +** → **Web Service** deux fois, en pointant
   `dockerfilePath` sur `backend/Dockerfile` et `frontend/Dockerfile`
   respectivement, `dockerContext` sur `backend` et `frontend`).
2. Sur `erp-elj-backend`, ajouter les variables d'environnement
   `DATABASE_URL` (bouton "Connect" pour lier la base créée), `JWT_SECRET`
   (générer une valeur aléatoire longue), `NODE_ENV=production`,
   `CORS_ORIGIN` (URL publique du frontend, ex.
   `https://erp-elj-frontend.onrender.com`).
3. Sur `erp-elj-frontend`, ajouter `VITE_API_URL` (URL publique du
   backend, ex. `https://erp-elj-backend.onrender.com`).

**Piège à connaître** : dans Render, `fromService: property: host` (utilisé
pour connecter deux services entre eux dans un Blueprint) renvoie le nom
interne réseau privé de Render, pas l'URL publique `*.onrender.com` —
injoignable depuis le navigateur d'un utilisateur. C'est pour ça que
`render.yaml` utilise des `value:` littérales plutôt que cette
référence : préférer toujours l'URL publique complète pour toute variable
lue côté navigateur (`VITE_API_URL`) ou comparée à l'en-tête `Origin` d'une
requête (`CORS_ORIGIN`).

## Mettre à jour l'application après ce premier déploiement

Render redéploie automatiquement à chaque push sur la branche connectée.
Aucune action manuelle nécessaire pour les mises à jour suivantes.
