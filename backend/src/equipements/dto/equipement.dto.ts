import { IsInt, IsOptional, IsString, IsEnum, IsDate, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { Criticite } from '@prisma/client';

export class CreateEquipementDto {
  @IsOptional() @IsString() codeSap?: string;
  @IsString() designation: string;
  @IsOptional() @IsString() constructeur?: string;
  @IsOptional() @IsString() marque?: string;
  @IsOptional() @IsString() modele?: string;
  @IsOptional() @IsString() numeroSerie?: string;
  @IsString() secteur: string;
  @IsOptional() @IsString() sousSecteur?: string;
  @IsOptional() @IsString() emplacement?: string;
  @IsOptional() @IsString() puissance?: string;
  @IsOptional() @IsString() tension?: string;
  @IsOptional() @IsString() courant?: string;
  @IsOptional() @Type(() => Number) @IsInt() annee?: number;
  // @Type(() => Date) plutôt que @IsDateString() : un <input type="date">
  // envoie "2026-01-01" (date seule), que Prisma refuse pour un DateTime.
  @IsOptional() @Type(() => Date) @IsDate() dateInstallation?: Date;
  @IsOptional() @Type(() => Date) @IsDate() dateDerniereIntervention?: Date;
  @IsOptional() @Type(() => Date) @IsDate() dateProchaineMaintenance?: Date;
  @IsOptional() @IsEnum(Criticite) criticite?: Criticite;
  @IsOptional() @IsString() commentaires?: string;
}

export class UpdateEquipementDto extends PartialType(CreateEquipementDto) {}

// Liste blanche des colonnes triables : évite qu'une valeur arbitraire
// passée telle quelle à Prisma.orderBy fasse échouer la requête.
const COLONNES_TRIABLES = [
  'designation', 'codeSap', 'secteur', 'criticite', 'annee',
  'dateInstallation', 'dateDerniereIntervention', 'dateProchaineMaintenance', 'createdAt',
] as const;

export class QueryEquipementDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() secteur?: string;
  @IsOptional() @IsEnum(Criticite) criticite?: Criticite;
  @IsOptional() @Type(() => Number) @IsInt() page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() pageSize?: number = 25;
  @IsOptional() @IsIn(COLONNES_TRIABLES) sortBy?: string = 'designation';
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc' = 'asc';
}
