import {
  Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { unlink } from 'fs/promises';
import { Response } from 'express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DocumentsService } from './documents.service';
import { CreateDocumentMetaDto } from './dto/document.dto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
// multer ne crée pas le dossier de destination : on le garantit au chargement du module.
mkdirSync(UPLOAD_DIR, { recursive: true });

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private service: DocumentsService) {}

  @Get()
  findByEntity(@Query('entityType') entityType: string, @Query('entityId') entityId: string) {
    return this.service.findByEntity(entityType, +entityId);
  }

  @Post('upload')
  @Roles('ADMINISTRATEUR', 'PREPARATEUR', 'MAINTENANCE', 'MAGASIN')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 Mo
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File, @Body() meta: CreateDocumentMetaDto, @Req() req: any) {
    return this.service.create(meta, file.path, file.originalname, req.user.userId);
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.service.findOne(+id);
    res.sendFile(doc.fichierUrl, { root: '.' });
  }

  @Delete(':id')
  @Roles('ADMINISTRATEUR')
  async remove(@Param('id') id: string) {
    const doc = await this.service.remove(+id);
    try { await unlink(doc.fichierUrl); } catch { /* fichier déjà absent : rien à faire */ }
    return { success: true };
  }
}
