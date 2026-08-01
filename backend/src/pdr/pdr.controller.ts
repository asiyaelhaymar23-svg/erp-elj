import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PdrService } from './pdr.service';
import { CreateArticlePdrDto, UpdateArticlePdrDto, QueryArticlePdrDto } from './dto/article-pdr.dto';

@ApiTags('pdr')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pdr')
export class PdrController {
  constructor(private service: PdrService) {}

  @Get()
  findAll(@Query() query: QueryArticlePdrDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'MAGASIN')
  create(@Body() dto: CreateArticlePdrDto, @Req() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Patch(':id')
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'MAGASIN')
  update(@Param('id') id: string, @Body() dto: UpdateArticlePdrDto, @Req() req: any) {
    return this.service.update(+id, dto, req.user.userId);
  }

  @Patch(':id/archive')
  @Roles('ADMINISTRATEUR', 'MAGASIN')
  archive(@Param('id') id: string, @Req() req: any) {
    return this.service.archive(+id, req.user.userId);
  }

  @Delete(':id')
  @Roles('ADMINISTRATEUR')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(+id, req.user.userId);
  }
}
