// Décodage minimal du payload JWT stocké côté client, uniquement pour
// adapter l'affichage (masquer un lien de menu). Le contrôle réel des
// droits reste toujours fait côté serveur (RolesGuard).
export function getCurrentRole(): string | null {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role ?? null;
  } catch {
    return null;
  }
}
