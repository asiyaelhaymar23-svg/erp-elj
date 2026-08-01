import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { InterventionsService } from './interventions.service';
import { CreateInterventionDto, UpdateInterventionDto, QueryInterventionDto } from './dto/intervention.dto';

@ApiTags('interventions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interventions')
export class InterventionsController {
  constructor(private service: InterventionsService) {}

  @Get() findAll(@Query() query: QueryInterventionDto) { return this.service.findAll(query); }

  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  @Roles('ADMINISTRATEUR', 'MAINTENANCE', 'PREPARATEUR')
  create(@Body() dto: CreateInterventionDto, @Req() req: any) { return this.service.create(dto, req.user.userId); }

  @Patch(':id')
  @Roles('ADMINISTRATEUR', 'MAINTENANCE', 'PREPARATEUR')
  update(@Param('id') id: string, @Body() dto: UpdateInterventionDto) { return this.service.update(+id, dto); }

  @Delete(':id')
  @Roles('ADMINISTRATEUR')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
