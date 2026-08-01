import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ParametresService } from './parametres.service';
import { CreateParametreDto, UpdateParametreDto } from './dto/parametre.dto';

@ApiTags('parametres')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('parametres')
export class ParametresController {
  constructor(private service: ParametresService) {}

  // Accessible à tous les utilisateurs connectés : ces listes alimentent
  // les menus déroulants des formulaires (familles, secteurs, marques...).
  @Get()
  findByType(@Query('type') type: string) {
    return this.service.findByType(type);
  }

  @Get('types')
  listTypes() {
    return this.service.listTypes();
  }

  @Post()
  @Roles('ADMINISTRATEUR')
  create(@Body() dto: CreateParametreDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('ADMINISTRATEUR')
  update(@Param('id') id: string, @Body() dto: UpdateParametreDto) {
    return this.service.update(+id, dto);
  }

  @Patch(':id/deactivate')
  @Roles('ADMINISTRATEUR')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(+id);
  }
}
