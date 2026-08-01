import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommandeDto, UpdateCommandeDto, QueryCommandeDto } from './dto/commande.dto';

const DELAI_LIVRAISON_ATTENDU_JOURS = 30; // seuil au-delà duquel une commande non reçue est "en retard"

@Injectable()
export class CommandesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCommandeDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const where: Prisma.CommandeWhereInput = {
      AND: [
        query.search ? { numeroBc: { contains: query.search, mode: 'insensitive' } } : {},
        query.statut ? { statut: query.statut } : {},
      ],
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.commande.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        orderBy: { dateCommande: 'desc' },
        include: { fournisseur: true, demandeAchat: true },
      }),
      this.prisma.commande.count({ where }),
    ]);

    return { data: data.map((c) => this.withCalculs(c)), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const c = await this.prisma.commande.findUnique({ where: { id }, include: { fournisseur: true, demandeAchat: true } });
    if (!c) throw new NotFoundException(`Commande ${id} introuvable`);
    return this.withCalculs(c);
  }

  private withCalculs(c: any) {
    const joursEcoules = Math.round((Date.now() - new Date(c.dateCommande).getTime()) / 86400000);
    const enRetard = !c.dateReception && joursEcoules > DELAI_LIVRAISON_ATTENDU_JOURS;
    const delaiReception = c.dateReception
      ? Math.round((new Date(c.dateReception).getTime() - new Date(c.dateCommande).getTime()) / 86400000)
      : null;
    return { ...c, enRetard, delaiReceptionJours: delaiReception };
  }

  create(dto: CreateCommandeDto) {
    return this.prisma.commande.create({ data: dto as any });
  }

  update(id: number, dto: UpdateCommandeDto) {
    return this.prisma.commande.update({ where: { id }, data: dto as any });
  }

  remove(id: number) {
    return this.prisma.commande.delete({ where: { id } });
  }
}
