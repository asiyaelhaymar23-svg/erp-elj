import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFournisseurDto, UpdateFournisseurDto, QueryFournisseurDto } from './dto/fournisseur.dto';

@Injectable()
export class FournisseursService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryFournisseurDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const where: Prisma.FournisseurWhereInput = query.search
      ? { nom: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.fournisseur.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { nom: 'asc' },
        include: { _count: { select: { articles: true, commandes: true } } },
      }),
      this.prisma.fournisseur.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const f = await this.prisma.fournisseur.findUnique({
      where: { id },
      include: { articles: true, commandes: true, entrees: true, sorties: true },
    });
    if (!f) throw new NotFoundException(`Fournisseur ${id} introuvable`);
    return f;
  }

  create(dto: CreateFournisseurDto) {
    return this.prisma.fournisseur.create({ data: dto });
  }

  update(id: number, dto: UpdateFournisseurDto) {
    return this.prisma.fournisseur.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.fournisseur.delete({ where: { id } });
  }
}
