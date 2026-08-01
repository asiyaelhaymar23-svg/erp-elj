import { Module } from '@nestjs/common';
import { DemandesAchatService } from './demandes-achat.service';
import { DemandesAchatController } from './demandes-achat.controller';

@Module({
  controllers: [DemandesAchatController],
  providers: [DemandesAchatService],
})
export class DemandesAchatModule {}
