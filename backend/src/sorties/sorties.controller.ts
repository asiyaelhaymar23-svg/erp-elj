import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SortiesService } from './sorties.service';
import { CreateSortieDto, RetourSortieDto, QuerySortieDto } from './dto/sortie.dto';

@ApiTags('sorties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sorties')
export class SortiesController {
  constructor(private service: SortiesService) {}

  @Get() findAll(@Query() query: QuerySortieDto) { return this.service.findAll(query); }

  @Post()
  @Roles('ADMINISTRATEUR', 'MAGASIN', 'PREPARATEUR')
  create(@Body() dto: CreateSortieDto, @Req() req: any) { return this.service.create(dto, req.user.userId); }

  @Patch(':id/retour')
  @Roles('ADMINISTRATEUR', 'MAGASIN')
  marquerRetour(@Param('id') id: string, @Body() dto: RetourSortieDto) { return this.service.marquerRetour(+id, dto); }

  @Delete(':id')
  @Roles('ADMINISTRATEUR')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
