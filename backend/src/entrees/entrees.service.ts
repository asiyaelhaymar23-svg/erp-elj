import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntreeDto, QueryEntreeDto } from './dto/entree.dto';

@Injectable()
export class EntreesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryEntreeDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.entree.findMany({
        skip: (page - 1) * pageSize, take: pageSize, orderBy: { dateEntree: 'desc' },
        include: { article: true, equipement: true, utilisateur: { select: { fullName: true } }, fournisseur: true },
      }),
      this.prisma.entree.count(),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // Une entrée de stock et la mise à jour du stock actuel de l'article
  // doivent réussir ou échouer ensemble : transaction Prisma.
  async create(dto: CreateEntreeDto, utilisateurId: number) {
    return this.prisma.$transaction(async (tx) => {
      const entree = await tx.entree.create({ data: { ...dto, utilisateurId } });
      if (dto.articleId) {
        const article = await tx.articlePdr.update({
          where: { id: dto.articleId },
          data: { stockActuel: { increment: dto.quantite } },
        });
        const statut =
          article.stockActuel <= 0 ? 'RUPTURE' :
          article.stockActuel < article.stockMin ? 'CRITIQUE' :
          article.stockMax > 0 && article.stockActuel > article.stockMax ? 'SURSTOCK' : 'NORMAL';
        await tx.articlePdr.update({ where: { id: dto.articleId }, data: { statut } });
      }
      return entree;
    });
  }

  remove(id: number) {
    return this.prisma.entree.delete({ where: { id } });
  }
}
