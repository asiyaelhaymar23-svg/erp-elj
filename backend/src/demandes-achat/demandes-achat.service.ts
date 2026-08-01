import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDemandeAchatDto, UpdateDemandeAchatDto, QueryDemandeAchatDto } from './dto/demande-achat.dto';

@Injectable()
export class DemandesAchatService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryDemandeAchatDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const where: Prisma.DemandeAchatWhereInput = {
      AND: [
        query.search ? { numeroDa: { contains: query.search, mode: 'insensitive' } } : {},
        query.statut ? { statut: query.statut } : {},
        query.division ? { division: query.division } : {},
      ],
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.demandeAchat.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        orderBy: { dateCreation: 'desc' },
        include: { article: true, commandes: true },
      }),
      this.prisma.demandeAchat.count({ where }),
    ]);

    return {
      data: data.map((d) => this.withCalculs(d)),
      total, page, pageSize, totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number) {
    const d = await this.prisma.demandeAchat.findUnique({ where: { id }, include: { article: true, commandes: true } });
    if (!d) throw new NotFoundException(`DA ${id} introuvable`);
    return this.withCalculs(d);
  }

  // Délai DA → BC et statut de transformation, jamais stockés en dur :
  // recalculés à chaque lecture à partir des commandes liées.
  private withCalculs(d: any) {
    const premiereCommande = d.commandes?.[0];
    const delaiDaVersBc = premiereCommande
      ? Math.round((new Date(premiereCommande.dateCommande).getTime() - new Date(d.dateCreation).getTime()) / 86400000)
      : null;
    return { ...d, transformeeEnBc: Boolean(premiereCommande), delaiDaVersBcJours: delaiDaVersBc };
  }

  create(dto: CreateDemandeAchatDto) {
    return this.prisma.demandeAchat.create({ data: dto as any });
  }

  update(id: number, dto: UpdateDemandeAchatDto) {
    return this.prisma.demandeAchat.update({ where: { id }, data: dto as any });
  }

  remove(id: number) {
    return this.prisma.demandeAchat.delete({ where: { id } });
  }

  // Import SAP : upsert sur numeroDa pour ne jamais créer de doublon,
  // même si le fichier est réimporté plusieurs fois.
  async importFromRows(rows: Record<string, any>[]) {
    const result = { created: 0, updated: 0, errors: [] as { row: number; error: string }[] };
    for (const [index, row] of rows.entries()) {
      try {
        const numeroDa = String(row.numeroDa ?? row['Demande d\'achat']);
        const existing = await this.prisma.demandeAchat.findUnique({ where: { numeroDa } });
        const data = {
          numeroDa,
          division: row.division ?? row['Division'],
          demandeur: row.demandeur ?? row['Demandeur'],
          quantite: Number(row.quantite ?? row['Quantité demandée'] ?? 0),
          dateCreation: new Date(row.dateCreation ?? row['Date de la D.A.']),
          statut: row.statut ?? row['Statut de traitement'],
          priorite: row.priorite,
          nature: row.nature ?? 'OPEX',
        };
        if (existing) {
          await this.prisma.demandeAchat.update({ where: { numeroDa }, data });
          result.updated++;
        } else {
          await this.prisma.demandeAchat.create({ data });
          result.created++;
        }
      } catch (e: any) {
        result.errors.push({ row: index + 2, error: e.message });
      }
    }
    return result;
  }
}
