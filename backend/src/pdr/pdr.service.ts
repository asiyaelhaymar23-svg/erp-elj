import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatutStock } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticlePdrDto, UpdateArticlePdrDto, QueryArticlePdrDto } from './dto/article-pdr.dto';

@Injectable()
export class PdrService {
  constructor(private prisma: PrismaService) {}

  // Le statut n'est jamais saisi manuellement : il est toujours recalculé
  // à partir du stock actuel / mini / maxi, pour rester fiable.
  private computeStatut(stockActuel: number, stockMin: number, stockMax: number): StatutStock {
    if (stockActuel <= 0) return 'RUPTURE';
    if (stockActuel < stockMin) return 'CRITIQUE';
    if (stockMax > 0 && stockActuel > stockMax) return 'SURSTOCK';
    return 'NORMAL';
  }

  async findAll(query: QueryArticlePdrDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;

    const where: Prisma.ArticlePdrWhereInput = {
      archive: false,
      AND: [
        query.search
          ? {
              OR: [
                { designation: { contains: query.search, mode: 'insensitive' } },
                { codeSap: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {},
        query.statut ? { statut: query.statut } : {},
        query.classeAbc ? { classeAbc: query.classeAbc } : {},
      ],
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.articlePdr.findMany({
        where,
        include: { fournisseur: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { designation: 'asc' },
      }),
      this.prisma.articlePdr.count({ where }),
    ]);

    return {
      data: data.map((a) => ({ ...a, valeurStock: Number(a.prixUnitaire ?? 0) * a.stockActuel })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number) {
    const article = await this.prisma.articlePdr.findUnique({
      where: { id },
      include: { fournisseur: true, equipement: true },
    });
    if (!article) throw new NotFoundException(`Article PDR ${id} introuvable`);

    const consommation = await this.consommation12Mois(id);
    const couverture = consommation.moyenneMensuelle > 0
      ? Math.round(article.stockActuel / consommation.moyenneMensuelle)
      : null; // null = pas de rotation calculable, jamais 0 par défaut

    return { ...article, valeurStock: Number(article.prixUnitaire ?? 0) * article.stockActuel, consommation, couvertureEnMois: couverture };
  }

  // Consommation réelle sur 12 mois glissants à partir des sorties —
  // jamais une valeur codée en dur.
  private async consommation12Mois(articleId: number) {
    const depuis = new Date();
    depuis.setMonth(depuis.getMonth() - 12);

    const sorties = await this.prisma.sortie.aggregate({
      where: { articleId, dateSortie: { gte: depuis } },
      _sum: { quantite: true },
    });
    const total = sorties._sum.quantite ?? 0;
    return { totalAnnuel: total, moyenneMensuelle: Math.round((total / 12) * 100) / 100 };
  }

  async create(dto: CreateArticlePdrDto, userId: number) {
    const statut = this.computeStatut(dto.stockActuel ?? 0, dto.stockMin ?? 0, dto.stockMax ?? 0);
    const created = await this.prisma.articlePdr.create({ data: { ...dto, statut } });
    await this.logAudit(created.id, 'CREATE', userId, null, created);
    await this.checkAlerte(created.id);
    return created;
  }

  async update(id: number, dto: UpdateArticlePdrDto, userId: number) {
    const before = await this.prisma.articlePdr.findUnique({ where: { id } });
    if (!before) throw new NotFoundException(`Article PDR ${id} introuvable`);

    const stockActuel = dto.stockActuel ?? before.stockActuel;
    const stockMin = dto.stockMin ?? before.stockMin;
    const stockMax = dto.stockMax ?? before.stockMax;
    const statut = this.computeStatut(stockActuel, stockMin, stockMax);

    const updated = await this.prisma.articlePdr.update({ where: { id }, data: { ...dto, statut } });
    await this.logAudit(id, 'UPDATE', userId, before, updated);
    await this.checkAlerte(id);
    return updated;
  }

  async archive(id: number, userId: number) {
    const updated = await this.prisma.articlePdr.update({ where: { id }, data: { archive: true } });
    await this.logAudit(id, 'UPDATE', userId, null, { archive: true });
    return updated;
  }

  async remove(id: number, userId: number) {
    const before = await this.prisma.articlePdr.findUnique({ where: { id } });
    await this.prisma.articlePdr.delete({ where: { id } });
    await this.logAudit(id, 'DELETE', userId, before, null);
    return { success: true };
  }

  // Import Excel : une ligne = un article. Upsert sur codeSap (unique) pour
  // pouvoir réimporter un extrait de stock périodique (ex. export SAP)
  // sans dupliquer les articles déjà connus — même logique anti-doublon
  // que l'import des DA. Réutilise create()/update() pour garder le
  // recalcul du statut et l'audit cohérents avec la saisie manuelle.
  async importFromRows(rows: Record<string, any>[], userId: number) {
    const results = { created: 0, updated: 0, errors: [] as { row: number; error: string }[] };
    for (const [index, row] of rows.entries()) {
      try {
        const codeSap = String(row.codeSap ?? '').trim();
        if (!codeSap) throw new Error('codeSap manquant');

        const existing = await this.prisma.articlePdr.findUnique({ where: { codeSap } });
        if (existing) {
          await this.update(existing.id, row as UpdateArticlePdrDto, userId);
          results.updated++;
        } else {
          await this.create(row as CreateArticlePdrDto, userId);
          results.created++;
        }
      } catch (e: any) {
        results.errors.push({ row: index + 2, error: e.message }); // +2 = ligne Excel réelle (entête + 1-index)
      }
    }
    return results;
  }

  // Notification automatique dès qu'un article passe en rupture/critique —
  // à étendre aux autres cas (commande en retard, DA non validée, etc.)
  // dans NotificationsModule, en suivant ce même déclencheur post-écriture.
  private async checkAlerte(articleId: number) {
    const article = await this.prisma.articlePdr.findUnique({ where: { id: articleId } });
    if (!article) return;
    if (article.statut === 'RUPTURE' || article.statut === 'CRITIQUE') {
      const admins = await this.prisma.user.findMany({
        where: { role: { in: ['ADMINISTRATEUR', 'MAGASIN'] }, isActive: true },
      });
      await this.prisma.notification.createMany({
        data: admins.map((u) => ({
          utilisateurId: u.id,
          type: 'STOCK_BAS',
          message: `Stock ${article.statut.toLowerCase()} : ${article.designation} (${article.codeSap})`,
          entityType: 'ARTICLE_PDR',
          entityId: article.id,
        })),
      });
    }
  }

  private async logAudit(recordId: number, action: 'CREATE' | 'UPDATE' | 'DELETE', utilisateurId: number, before: unknown, after: unknown) {
    await this.prisma.historique.create({
      data: {
        tableName: 'articles_pdr',
        recordId,
        action,
        utilisateurId,
        ancienneValeur: before ? JSON.parse(JSON.stringify(before)) : undefined,
        nouvelleValeur: after ? JSON.parse(JSON.stringify(after)) : undefined,
      },
    });
  }
}
