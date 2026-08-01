import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParametreDto, UpdateParametreDto } from './dto/parametre.dto';

@Injectable()
export class ParametresService {
  constructor(private prisma: PrismaService) {}

  // Un seul modèle pour toutes les listes paramétrables (familles,
  // secteurs, marques, magasins...) : le frontend filtre par `type`,
  // ce qui évite de créer une table par liste.
  findByType(type: string) {
    return this.prisma.parametre.findMany({
      where: { type, actif: true },
      orderBy: { ordre: 'asc' },
    });
  }

  listTypes() {
    return this.prisma.parametre.findMany({ distinct: ['type'], select: { type: true } });
  }

  create(dto: CreateParametreDto) {
    return this.prisma.parametre.create({ data: dto });
  }

  update(id: number, dto: UpdateParametreDto) {
    return this.prisma.parametre.update({ where: { id }, data: dto });
  }

  // Désactivation plutôt que suppression : une valeur déjà utilisée sur
  // des enregistrements existants ne doit pas disparaître silencieusement.
  deactivate(id: number) {
    return this.prisma.parametre.update({ where: { id }, data: { actif: false } });
  }
}
