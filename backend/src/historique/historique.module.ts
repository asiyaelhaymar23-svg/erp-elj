import { Module } from '@nestjs/common';
import { HistoriqueService } from './historique.service';
import { HistoriqueController } from './historique.controller';

@Module({
  controllers: [HistoriqueController],
  providers: [HistoriqueService],
})
export class HistoriqueModule {}
