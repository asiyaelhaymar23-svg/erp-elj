import { Module } from '@nestjs/common';
import { SortiesService } from './sorties.service';
import { SortiesController } from './sorties.controller';

@Module({
  controllers: [SortiesController],
  providers: [SortiesService],
})
export class SortiesModule {}
