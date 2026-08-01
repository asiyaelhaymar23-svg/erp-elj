import { IsEnum, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TypeDocument } from '@prisma/client';

export class CreateDocumentMetaDto {
  @IsString() entityType: string; // "EQUIPEMENT" | "ARTICLE_PDR" | "INTERVENTION" | ...
  @Type(() => Number) @IsInt() entityId: number;
  @IsEnum(TypeDocument) typeDocument: TypeDocument;
}
