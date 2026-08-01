import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterventionDto, UpdateInterventionDto, QueryInterventionDto } from './dto/intervention.dto';

@Injectable()
export class InterventionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryInterventionDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const where: Prisma.InterventionWhereInput = query.equipementId ? { equipementId: query.equipementId } : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.intervention.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        orderBy: { dateIntervention: 'desc' },
        include: { equipement: { select: { designation: true, secteur: true } }, createdBy: { select: { fullName: true } } },
      }),
      this.prisma.intervention.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const i = await this.prisma.intervention.findUnique({
      where: { id },
      include: { equipement: true, createdBy: { select: { fullName: true } } },
    });
    if (!i) throw new NotFoundException(`Intervention ${id} introuvable`);
    return i;
  }

  // Créer une intervention met aussi à jour la date de dernière intervention
  // de l'équipement concerné — dans la même transaction, jamais désynchronisé.
  async create(dto: CreateInterventionDto, createdById: number) {
    return this.prisma.$transaction(async (tx) => {
      const intervention = await tx.intervention.create({ data: { ...dto, createdById } });
      await tx.equipement.update({
        where: { id: dto.equipementId },
        data: { dateDerniereIntervention: dto.dateIntervention },
      });
      return intervention;
    });
  }

  update(id: number, dto: UpdateInterventionDto) {
    return this.prisma.intervention.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.intervention.delete({ where: { id } });
  }
}
