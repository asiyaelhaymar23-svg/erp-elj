import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipementDto, UpdateEquipementDto, QueryEquipementDto } from './dto/equipement.dto';

@Injectable()
export class EquipementsService {
  constructor(private prisma: PrismaService) {}

  // Recherche + filtres + tri + pagination — aucune valeur codée en dur,
  // tout provient de la requête et de la base.
  async findAll(query: QueryEquipementDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;

    const where: Prisma.EquipementWhereInput = {
      AND: [
        query.search
          ? {
              OR: [
                { designation: { contains: query.search, mode: 'insensitive' } },
                { codeSap: { contains: query.search, mode: 'insensitive' } },
                { numeroSerie: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {},
        query.secteur ? { secteur: query.secteur } : {},
        query.criticite ? { criticite: query.criticite } : {},
      ],
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.equipement.findMany({
        where,
        orderBy: { [query.sortBy || 'designation']: query.sortOrder || 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { articlesPdr: true, interventions: true, documents: true } } },
      }),
      this.prisma.equipement.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const equipement = await this.prisma.equipement.findUnique({
      where: { id },
      include: {
        articlesPdr: true,
        interventions: { orderBy: { dateIntervention: 'desc' } },
        documents: true,
      },
    });
    if (!equipement) throw new NotFoundException(`Équipement ${id} introuvable`);
    return equipement;
  }

  async create(dto: CreateEquipementDto, userId: number) {
    const created = await this.prisma.equipement.create({ data: dto });
    await this.logAudit('equipements', created.id, 'CREATE', userId, null, created);
    return created;
  }

  async update(id: number, dto: UpdateEquipementDto, userId: number) {
    const before = await this.findOne(id);
    const updated = await this.prisma.equipement.update({ where: { id }, data: dto });
    await this.logAudit('equipements', id, 'UPDATE', userId, before, updated);
    return updated;
  }

  async remove(id: number, userId: number) {
    const before = await this.findOne(id);
    await this.prisma.equipement.delete({ where: { id } });
    await this.logAudit('equipements', id, 'DELETE', userId, before, null);
    return { success: true };
  }

  async duplicate(id: number, userId: number) {
    const original = await this.findOne(id);
    const { id: _id, codeSap, createdAt, updatedAt, articlesPdr, interventions, documents, ...rest } = original as any;
    const copy = await this.prisma.equipement.create({
      data: { ...rest, codeSap: codeSap ? `${codeSap}-COPIE` : undefined, designation: `${rest.designation} (copie)` },
    });
    await this.logAudit('equipements', copy.id, 'CREATE', userId, null, copy);
    return copy;
  }

  // Import Excel : une ligne = un équipement. Colonnes mappées 1:1 sur les
  // champs du DTO ; les lignes en erreur sont retournées pour correction
  // plutôt que de faire échouer tout le fichier.
  async importFromRows(rows: Record<string, any>[], userId: number) {
    const results = { created: 0, errors: [] as { row: number; error: string }[] };
    for (const [index, row] of rows.entries()) {
      try {
        const created = await this.create(row as CreateEquipementDto, userId);
        results.created++;
      } catch (e: any) {
        results.errors.push({ row: index + 2, error: e.message }); // +2 = ligne Excel réelle (entête + 1-index)
      }
    }
    return results;
  }

  async exportAll() {
    return this.prisma.equipement.findMany({ orderBy: { secteur: 'asc' } });
  }

  private async logAudit(
    tableName: string,
    recordId: number,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    utilisateurId: number,
    before: unknown,
    after: unknown,
  ) {
    await this.prisma.historique.create({
      data: {
        tableName,
        recordId,
        action,
        utilisateurId,
        ancienneValeur: before ? JSON.parse(JSON.stringify(before)) : undefined,
        nouvelleValeur: after ? JSON.parse(JSON.stringify(after)) : undefined,
      },
    });
  }
}
