import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentMetaDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  findByEntity(entityType: string, entityId: number) {
    return this.prisma.document.findMany({
      where: { entityType, entityId },
      include: { uploadedBy: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException(`Document ${id} introuvable`);
    return doc;
  }

  // fichierUrl pointe ici vers le stockage local (voir DocumentsController) ;
  // en production, remplacer par l'URL du bucket Azure Blob / S3 configuré
  // dans le cahier des charges — le reste du code ne change pas.
  create(meta: CreateDocumentMetaDto, fichierUrl: string, nomFichier: string, uploadedById: number) {
    return this.prisma.document.create({
      data: { ...meta, fichierUrl, nomFichier, uploadedById },
    });
  }

  async remove(id: number) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException(`Document ${id} introuvable`);
    await this.prisma.document.delete({ where: { id } });
    return doc; // le contrôleur supprime le fichier physique correspondant
  }
}
