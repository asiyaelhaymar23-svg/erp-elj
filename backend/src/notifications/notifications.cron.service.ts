import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

const JOURS_ALERTE_MAINTENANCE = 7;
const JOURS_RETARD_COMMANDE = 30;
const JOURS_ATTENTE_DA = 15;
// Évite de relancer la même alerte tous les jours tant qu'elle n'a pas été traitée.
const JOURS_SANS_RELANCE = 3;

// Jobs planifiés qui suivent le pattern déjà en place dans PdrService.checkAlerte() :
// une notification n'est créée que si aucune alerte équivalente n'a été
// envoyée récemment pour la même entité.
@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async executerControlesQuotidiens() {
    const [maintenance, commandes, da] = await Promise.all([
      this.alerterMaintenanceAVenir(),
      this.alerterCommandesEnRetard(),
      this.alerterDaEnAttente(),
    ]);
    this.logger.log(`Contrôles quotidiens : ${maintenance} maintenance(s), ${commandes} commande(s) en retard, ${da} DA en attente notifiées.`);
  }

  private async dejaNotifieRecemment(type: string, entityType: string, entityId: number) {
    const depuis = new Date();
    depuis.setDate(depuis.getDate() - JOURS_SANS_RELANCE);
    const existante = await this.prisma.notification.findFirst({
      where: { type, entityType, entityId, createdAt: { gte: depuis } },
    });
    return Boolean(existante);
  }

  private async destinataires(roles: string[]) {
    return this.prisma.user.findMany({ where: { role: { in: roles as any }, isActive: true } });
  }

  private async alerterMaintenanceAVenir() {
    const dansSeptJours = new Date();
    dansSeptJours.setDate(dansSeptJours.getDate() + JOURS_ALERTE_MAINTENANCE);

    const equipements = await this.prisma.equipement.findMany({
      where: { dateProchaineMaintenance: { not: null, lte: dansSeptJours, gte: new Date() } },
    });

    const destinataires = await this.destinataires(['ADMINISTRATEUR', 'MAINTENANCE']);
    let count = 0;
    for (const equipement of equipements) {
      if (await this.dejaNotifieRecemment('MAINTENANCE', 'EQUIPEMENT', equipement.id)) continue;
      await Promise.all(
        destinataires.map((u) =>
          this.notifications.creerNotification(
            u.id,
            'MAINTENANCE',
            `Maintenance à prévoir avant le ${equipement.dateProchaineMaintenance!.toLocaleDateString('fr-FR')} : ${equipement.designation}`,
            'EQUIPEMENT',
            equipement.id,
          ),
        ),
      );
      count++;
    }
    return count;
  }

  private async alerterCommandesEnRetard() {
    const seuil = new Date();
    seuil.setDate(seuil.getDate() - JOURS_RETARD_COMMANDE);

    const commandes = await this.prisma.commande.findMany({
      where: { dateReception: null, dateCommande: { lte: seuil } },
    });

    const destinataires = await this.destinataires(['ADMINISTRATEUR', 'RESPONSABLE']);
    let count = 0;
    for (const commande of commandes) {
      if (await this.dejaNotifieRecemment('COMMANDE_RETARD', 'COMMANDE', commande.id)) continue;
      await Promise.all(
        destinataires.map((u) =>
          this.notifications.creerNotification(
            u.id,
            'COMMANDE_RETARD',
            `Commande ${commande.numeroBc} non réceptionnée depuis plus de ${JOURS_RETARD_COMMANDE} jours`,
            'COMMANDE',
            commande.id,
          ),
        ),
      );
      count++;
    }
    return count;
  }

  private async alerterDaEnAttente() {
    const seuil = new Date();
    seuil.setDate(seuil.getDate() - JOURS_ATTENTE_DA);

    const demandes = await this.prisma.demandeAchat.findMany({
      where: { dateValidation: null, dateCreation: { lte: seuil } },
    });

    const destinataires = await this.destinataires(['ADMINISTRATEUR', 'RESPONSABLE']);
    let count = 0;
    for (const da of demandes) {
      if (await this.dejaNotifieRecemment('DA_ATTENTE', 'DEMANDE_ACHAT', da.id)) continue;
      await Promise.all(
        destinataires.map((u) =>
          this.notifications.creerNotification(
            u.id,
            'DA_ATTENTE',
            `DA ${da.numeroDa} en attente de validation depuis plus de ${JOURS_ATTENTE_DA} jours`,
            'DEMANDE_ACHAT',
            da.id,
          ),
        ),
      );
      count++;
    }
    return count;
  }
}
