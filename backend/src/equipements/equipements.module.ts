import { Module } from '@nestjs/common';
import { EquipementsService } from './equipements.service';
import { EquipementsController } from './equipements.controller';

@Module({
  controllers: [EquipementsController],
  providers: [EquipementsService],
  exports: [EquipementsService],
})
export class EquipementsModule {}
