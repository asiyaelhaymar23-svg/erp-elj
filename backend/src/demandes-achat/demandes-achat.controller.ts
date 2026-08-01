import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as XLSX from 'xlsx';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DemandesAchatService } from './demandes-achat.service';
import { CreateDemandeAchatDto, UpdateDemandeAchatDto, QueryDemandeAchatDto } from './dto/demande-achat.dto';

@ApiTags('demandes-achat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('demandes-achat')
export class DemandesAchatController {
  constructor(private service: DemandesAchatService) {}

  @Get() findAll(@Query() query: QueryDemandeAchatDto) { return this.service.findAll(query); }

  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'RESPONSABLE')
  create(@Body() dto: CreateDemandeAchatDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'RESPONSABLE')
  update(@Param('id') id: string, @Body() dto: UpdateDemandeAchatDto) { return this.service.update(+id, dto); }

  @Delete(':id')
  @Roles('ADMINISTRATEUR')
  remove(@Param('id') id: string) { return this.service.remove(+id); }

  @Post('import')
  @Roles('ADMINISTRATEUR', 'PREPARATEUR')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    return this.service.importFromRows(rows as Record<string, any>[]);
  }
}
