import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, fullName: true, role: true, isActive: true, lastLoginAt: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await this.authService.hashPassword(dto.password);
    return this.prisma.user.create({
      data: { email: dto.email, fullName: dto.fullName, role: dto.role, passwordHash },
      select: { id: true, email: true, fullName: true, role: true },
    });
  }

  update(id: number, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  // Désactivation plutôt que suppression physique : préserve l'historique
  // (interventions, entrées/sorties, documents créés par cet utilisateur).
  deactivate(id: number) {
    return this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }
}
