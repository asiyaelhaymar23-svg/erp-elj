import { Module } from '@nestjs/common';
import { PdrService } from './pdr.service';
import { PdrController } from './pdr.controller';

@Module({
  controllers: [PdrController],
  providers: [PdrService],
})
export class PdrModule {}
