import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { HistoriqueService } from './historique.service';

@ApiTags('historique')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRATEUR', 'RESPONSABLE', 'DIRECTION')
@Controller('historique')
export class HistoriqueController {
  constructor(private service: HistoriqueService) {}

  @Get()
  findAll(
    @Query('tableName') tableName?: string,
    @Query('recordId') recordId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findAll({
      tableName, recordId: recordId ? +recordId : undefined,
      page: page ? +page : undefined, pageSize: pageSize ? +pageSize : undefined,
    });
  }
}
