import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findForUser(utilisateurId: number) {
    return this.prisma.notification.findMany({
      where: { utilisateurId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  countUnread(utilisateurId: number) {
    return this.prisma.notification.count({ where: { utilisateurId, isRead: false } });
  }

  markAsRead(id: number) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  markAllAsRead(utilisateurId: number) {
    return this.prisma.notification.updateMany({ where: { utilisateurId, isRead: false }, data: { isRead: true } });
  }

  // Générateurs de notifications à appeler depuis un job planifié
  // (ex. tâche cron NestJS @Cron) — pattern identique à checkAlerte() du
  // module PDR pour "commande en retard", "DA non validée",
  // "maintenance à réaliser", "contrat expiré".
  async creerNotification(utilisateurId: number, type: string, message: string, entityType?: string, entityId?: number) {
    return this.prisma.notification.create({ data: { utilisateurId, type, message, entityType, entityId } });
  }
}
