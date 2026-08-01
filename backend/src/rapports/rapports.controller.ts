import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RapportsService } from './rapports.service';

@ApiTags('rapports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rapports')
export class RapportsController {
  constructor(private service: RapportsService) {}

  @Get('synthese.xlsx')
  async synthese(@Res() res: Response) {
    const buffer = await this.service.genererRapportSynthese();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=rapport-synthese-${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
    res.send(buffer);
  }

  @Get('synthese.pdf')
  async synthesePdf(@Res() res: Response) {
    const buffer = await this.service.genererRapportSynthesePdf();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=rapport-synthese-${new Date().toISOString().slice(0, 10)}.pdf`,
    });
    res.send(buffer);
  }
}
