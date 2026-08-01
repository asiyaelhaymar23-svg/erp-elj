import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FournisseursService } from './fournisseurs.service';
import { CreateFournisseurDto, UpdateFournisseurDto, QueryFournisseurDto } from './dto/fournisseur.dto';

@ApiTags('fournisseurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fournisseurs')
export class FournisseursController {
  constructor(private service: FournisseursService) {}

  @Get() findAll(@Query() query: QueryFournisseurDto) { return this.service.findAll(query); }

  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'RESPONSABLE')
  create(@Body() dto: CreateFournisseurDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'RESPONSABLE')
  update(@Param('id') id: string, @Body() dto: UpdateFournisseurDto) { return this.service.update(+id, dto); }

  @Delete(':id')
  @Roles('ADMINISTRATEUR')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
