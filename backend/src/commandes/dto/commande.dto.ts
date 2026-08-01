import { IsDate, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export class CreateCommandeDto {
  @IsString() numeroBc: string;
  @IsOptional() @Type(() => Number) @IsInt() demandeAchatId?: number;
  @IsOptional() @Type(() => Number) @IsInt() fournisseurId?: number;
  @IsOptional() @Type(() => Number) @IsNumber() montant?: number;
  // @Type(() => Date) plutôt que @IsDateString() : un <input type="date">
  // envoie "2026-01-01" (date seule), que Prisma refuse pour un DateTime
  // ("premature end of input, expected ISO-8601 DateTime"). @Type() le
  // convertit en véritable Date, que Prisma accepte toujours.
  @Type(() => Date) @IsDate() dateCommande: Date;
  @IsOptional() @Type(() => Date) @IsDate() dateReception?: Date;
  @IsOptional() @IsString() statut?: string;
}

export class UpdateCommandeDto extends PartialType(CreateCommandeDto) {}

export class QueryCommandeDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() statut?: string;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
