import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepenseDto, UpdateDepenseDto, QueryDepenseDto } from './dto/depense.dto';

@Injectable()
export class DepensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryDepenseDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const where: Prisma.DepenseWhereInput = {
      AND: [
        query.secteur ? { secteur: query.secteur } : {},
        query.nature ? { nature: query.nature } : {},
        query.type ? { type: query.type } : {},
      ],
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.depense.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { date: 'desc' },
        include: { fournisseur: true, article: true },
      }),
      this.prisma.depense.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // Synthèse par secteur/type, recalculée à chaque appel — aucun total
  // n'est mis en cache ni codé en dur.
  async synthese() {
    const parSecteur = await this.prisma.depense.groupBy({ by: ['secteur'], _sum: { montant: true } });
    const parType = await this.prisma.depense.groupBy({ by: ['type'], _sum: { montant: true } });
    const total = await this.prisma.depense.aggregate({ _sum: { montant: true }, _count: true });
    return { parSecteur, parType, total: total._sum.montant ?? 0, nombreInterventions: total._count };
  }

  create(dto: CreateDepenseDto) {
    return this.prisma.depense.create({ data: dto as any });
  }

  update(id: number, dto: UpdateDepenseDto) {
    return this.prisma.depense.update({ where: { id }, data: dto as any });
  }

  remove(id: number) {
    return this.prisma.depense.delete({ where: { id } });
  }
}
