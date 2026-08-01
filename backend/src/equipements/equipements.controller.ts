import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, Req,
  UploadedFile, UseGuards, UseInterceptors, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EquipementsService } from './equipements.service';
import { CreateEquipementDto, UpdateEquipementDto, QueryEquipementDto } from './dto/equipement.dto';
import * as XLSX from 'xlsx';

@ApiTags('equipements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipements')
export class EquipementsController {
  constructor(private service: EquipementsService) {}

  @Get()
  findAll(@Query() query: QueryEquipementDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'MAINTENANCE')
  create(@Body() dto: CreateEquipementDto, @Req() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Patch(':id')
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'MAINTENANCE')
  update(@Param('id') id: string, @Body() dto: UpdateEquipementDto, @Req() req: any) {
    return this.service.update(+id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles('ADMINISTRATEUR')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(+id, req.user.userId);
  }

  @Post(':id/duplicate')
  @Roles('ADMINISTRATEUR', 'PREPARATEUR')
  duplicate(@Param('id') id: string, @Req() req: any) {
    return this.service.duplicate(+id, req.user.userId);
  }

  // ---- Import / Export Excel ----

  @Post('import')
  @Roles('ADMINISTRATEUR', 'PREPARATEUR')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    return this.service.importFromRows(rows as Record<string, any>[], req.user.userId);
  }

  @Get('export/xlsx')
  async exportXlsx(@Res() res: Response) {
    const data = await this.service.exportAll();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Equipements');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=equipements.xlsx',
    });
    res.send(buffer);
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const data = await this.service.exportAll();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=equipements.csv' });
    res.send(csv);
  }

  // L'export PDF suit le même principe avec la librairie retenue pour les
  // rapports (voir module Rapports à créer sur ce modèle — pdf-lib ou
  // Puppeteer selon la mise en page souhaitée).
}
