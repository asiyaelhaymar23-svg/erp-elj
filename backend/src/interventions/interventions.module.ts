import { Module } from '@nestjs/common';
import { InterventionsService } from './interventions.service';
import { InterventionsController } from './interventions.controller';

@Module({
  controllers: [InterventionsController],
  providers: [InterventionsService],
})
export class InterventionsModule {}
