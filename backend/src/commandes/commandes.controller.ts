import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CommandesService } from './commandes.service';
import { CreateCommandeDto, UpdateCommandeDto, QueryCommandeDto } from './dto/commande.dto';

@ApiTags('commandes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('commandes')
export class CommandesController {
  constructor(private service: CommandesService) {}

  @Get() findAll(@Query() query: QueryCommandeDto) { return this.service.findAll(query); }

  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'RESPONSABLE')
  create(@Body() dto: CreateCommandeDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'RESPONSABLE')
  update(@Param('id') id: string, @Body() dto: UpdateCommandeDto) { return this.service.update(+id, dto); }

  @Delete(':id')
  @Roles('ADMINISTRATEUR')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
