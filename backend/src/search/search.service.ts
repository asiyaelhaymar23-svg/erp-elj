import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const LIMIT_PAR_TYPE = 10;

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  // Une recherche globale = plusieurs recherches ciblées lancées en
  // parallèle, jamais une jointure unique sur des tables hétérogènes.
  async search(q: string) {
    if (!q || q.trim().length < 2) return { equipements: [], articles: [], demandesAchat: [], commandes: [], fournisseurs: [], documents: [] };

    const [equipements, articles, demandesAchat, commandes, fournisseurs, documents] = await Promise.all([
      this.prisma.equipement.findMany({
        where: { OR: [
          { designation: { contains: q, mode: 'insensitive' } },
          { codeSap: { contains: q, mode: 'insensitive' } },
          { numeroSerie: { contains: q, mode: 'insensitive' } },
          { constructeur: { contains: q, mode: 'insensitive' } },
        ] },
        take: LIMIT_PAR_TYPE,
      }),
      this.prisma.articlePdr.findMany({
        where: { OR: [
          { designation: { contains: q, mode: 'insensitive' } },
          { codeSap: { contains: q, mode: 'insensitive' } },
        ] },
        take: LIMIT_PAR_TYPE,
      }),
      this.prisma.demandeAchat.findMany({
        where: { numeroDa: { contains: q, mode: 'insensitive' } },
        take: LIMIT_PAR_TYPE,
      }),
      this.prisma.commande.findMany({
        where: { numeroBc: { contains: q, mode: 'insensitive' } },
        take: LIMIT_PAR_TYPE,
      }),
      this.prisma.fournisseur.findMany({
        where: { nom: { contains: q, mode: 'insensitive' } },
        take: LIMIT_PAR_TYPE,
      }),
      this.prisma.document.findMany({
        where: { nomFichier: { contains: q, mode: 'insensitive' } },
        take: LIMIT_PAR_TYPE,
      }),
    ]);

    return { equipements, articles, demandesAchat, commandes, fournisseurs, documents };
  }
}
