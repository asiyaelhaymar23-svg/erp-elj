import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DepensesService } from './depenses.service';
import { CreateDepenseDto, UpdateDepenseDto, QueryDepenseDto } from './dto/depense.dto';

@ApiTags('depenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('depenses')
export class DepensesController {
  constructor(private service: DepensesService) {}

  @Get() findAll(@Query() query: QueryDepenseDto) { return this.service.findAll(query); }

  @Get('synthese') synthese() { return this.service.synthese(); }

  @Post()
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'RESPONSABLE')
  create(@Body() dto: CreateDepenseDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'RESPONSABLE')
  update(@Param('id') id: string, @Body() dto: UpdateDepenseDto) { return this.service.update(+id, dto); }

  @Delete(':id')
  @Roles('ADMINISTRATEUR')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
