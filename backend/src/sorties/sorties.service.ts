import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSortieDto, RetourSortieDto, QuerySortieDto } from './dto/sortie.dto';

const RETARD_JOURS = 30;

@Injectable()
export class SortiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QuerySortieDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const where: Prisma.SortieWhereInput = query.statut ? { statut: query.statut as any } : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.sortie.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { dateSortie: 'desc' },
        include: { article: true, equipement: true, fournisseur: true, utilisateur: { select: { fullName: true } } },
      }),
      this.prisma.sortie.count({ where }),
    ]);

    // Le statut "en retard" se déduit à la volée : jamais stocké tel quel
    // pour éviter qu'il devienne obsolète entre deux passages d'un job.
    const now = Date.now();
    return {
      data: data.map((s) => ({
        ...s,
        enRetard: !s.dateRetourReelle && (now - new Date(s.dateSortie).getTime()) / 86400000 > RETARD_JOURS,
      })),
      total, page, pageSize, totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(dto: CreateSortieDto, utilisateurId: number) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.articleId) {
        const article = await tx.articlePdr.findUnique({ where: { id: dto.articleId } });
        if (!article) throw new NotFoundException(`Article PDR ${dto.articleId} introuvable`);
        // Le stock physique ne peut pas devenir négatif : une sortie ne
        // peut pas prendre plus que ce qui est réellement en magasin.
        if (article.stockActuel < dto.quantite) {
          throw new BadRequestException(
            `Stock insuffisant pour ${article.designation} (disponible : ${article.stockActuel}, demandé : ${dto.quantite})`,
          );
        }
      }

      const sortie = await tx.sortie.create({ data: { ...dto, utilisateurId, statut: 'EN_ATTENTE' } });
      if (dto.articleId) {
        await tx.articlePdr.update({ where: { id: dto.articleId }, data: { stockActuel: { decrement: dto.quantite } } });
      }
      return sortie;
    });
  }

  // Marque une sortie comme retournée (totalement ou partiellement) et
  // réintègre la quantité correspondante dans le stock de l'article. Une
  // seule opération de retour par sortie : rien ne permet de suivre un
  // cumul entre plusieurs retours partiels, donc on l'interdit plutôt que
  // de risquer un double crédit du stock.
  async marquerRetour(id: number, dto: RetourSortieDto) {
    const sortie = await this.prisma.sortie.findUnique({ where: { id } });
    if (!sortie) throw new NotFoundException(`Sortie ${id} introuvable`);
    if (sortie.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Cette sortie a déjà fait l\'objet d\'un retour.');
    }

    const quantiteRetournee = dto.quantiteRetournee ?? sortie.quantite;
    if (quantiteRetournee <= 0 || quantiteRetournee > sortie.quantite) {
      throw new BadRequestException(`La quantité retournée doit être comprise entre 1 et ${sortie.quantite}.`);
    }
    const statut = quantiteRetournee >= sortie.quantite ? 'RETOURNE' : 'PARTIEL';

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.sortie.update({
        where: { id },
        data: { dateRetourReelle: dto.dateRetourReelle, statut },
      });
      if (sortie.articleId) {
        await tx.articlePdr.update({ where: { id: sortie.articleId }, data: { stockActuel: { increment: quantiteRetournee } } });
      }
      return updated;
    });
  }

  remove(id: number) {
    return this.prisma.sortie.delete({ where: { id } });
  }
}
