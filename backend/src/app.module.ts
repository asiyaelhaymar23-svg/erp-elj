import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EquipementsModule } from './equipements/equipements.module';
import { PdrModule } from './pdr/pdr.module';
import { FournisseursModule } from './fournisseurs/fournisseurs.module';
import { DemandesAchatModule } from './demandes-achat/demandes-achat.module';
import { CommandesModule } from './commandes/commandes.module';
import { EntreesModule } from './entrees/entrees.module';
import { SortiesModule } from './sorties/sorties.module';
import { DepensesModule } from './depenses/depenses.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HistoriqueModule } from './historique/historique.module';
import { ParametresModule } from './parametres/parametres.module';
import { InterventionsModule } from './interventions/interventions.module';
import { SearchModule } from './search/search.module';
import { RapportsModule } from './rapports/rapports.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Limite globale par défaut ; /auth/login applique une limite plus
    // stricte via @Throttle sur son propre handler (voir AuthController).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    EquipementsModule,
    PdrModule,
    FournisseursModule,
    DemandesAchatModule,
    CommandesModule,
    EntreesModule,
    SortiesModule,
    DepensesModule,
    DocumentsModule,
    NotificationsModule,
    HistoriqueModule,
    ParametresModule,
    InterventionsModule,
    SearchModule,
    RapportsModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
