import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoriqueService {
  constructor(private prisma: PrismaService) {}

  // L'historique n'est jamais modifiable depuis l'API : uniquement
  // consultable. Les écritures viennent exclusivement de logAudit() dans
  // chaque module métier.
  findAll(params: { tableName?: string; recordId?: number; page?: number; pageSize?: number }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const where = {
      ...(params.tableName ? { tableName: params.tableName } : {}),
      ...(params.recordId ? { recordId: params.recordId } : {}),
    };

    return this.prisma.$transaction([
      this.prisma.historique.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { utilisateur: { select: { fullName: true, email: true } } },
      }),
      this.prisma.historique.count({ where }),
    ]).then(([data, total]) => ({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }));
  }
}
