// Peuplement initial : un compte administrateur + quelques listes
// paramétrables de départ. À lancer une seule fois : npm run prisma:seed
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMoi123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@sonasid-elj.local' },
    update: {},
    create: {
      email: 'admin@sonasid-elj.local',
      fullName: 'Administrateur ELJ',
      role: 'ADMINISTRATEUR',
      passwordHash,
    },
  });

  const secteurs = ['Four', 'Laminage', 'Finissage', 'Auxiliaires', 'Commun', 'Consommable'];
  for (const [i, valeur] of secteurs.entries()) {
    await prisma.parametre.upsert({
      where: { type_valeur: { type: 'SECTEUR', valeur } },
      update: {},
      create: { type: 'SECTEUR', valeur, ordre: i },
    });
  }

  console.log('Seed terminé — connexion admin : admin@sonasid-elj.local / ChangeMoi123!');
}

main().finally(() => prisma.$disconnect());
