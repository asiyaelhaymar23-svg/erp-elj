import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EntreesService } from './entrees.service';
import { CreateEntreeDto, QueryEntreeDto } from './dto/entree.dto';

@ApiTags('entrees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('entrees')
export class EntreesController {
  constructor(private service: EntreesService) {}

  @Get() findAll(@Query() query: QueryEntreeDto) { return this.service.findAll(query); }

  @Post()
  @Roles('ADMINISTRATEUR', 'MAGASIN', 'PREPARATEUR')
  create(@Body() dto: CreateEntreeDto, @Req() req: any) { return this.service.create(dto, req.user.userId); }

  @Delete(':id')
  @Roles('ADMINISTRATEUR', 'MAGASIN')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
