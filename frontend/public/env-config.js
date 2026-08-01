// Développement local : aucune valeur injectée, api.ts retombe sur
// import.meta.env.VITE_API_URL. En conteneur, docker-entrypoint.sh
// régénère ce fichier au démarrage avec l'URL réelle de l'API.
window.__ENV__ = {};
