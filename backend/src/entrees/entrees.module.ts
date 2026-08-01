import { Module } from '@nestjs/common';
import { EntreesService } from './entrees.service';
import { EntreesController } from './entrees.controller';

@Module({
  controllers: [EntreesController],
  providers: [EntreesService],
})
export class EntreesModule {}
