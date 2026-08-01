import { IsInt, IsOptional, IsString, IsEnum, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
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
  @IsOptional() @IsDateString() dateInstallation?: string;
  @IsOptional() @IsDateString() dateDerniereIntervention?: string;
  @IsOptional() @IsDateString() dateProchaineMaintenance?: string;
  @IsOptional() @IsEnum(Criticite) criticite?: Criticite;
  @IsOptional() @IsString() commentaires?: string;
}

export class UpdateEquipementDto extends CreateEquipementDto {}

export class QueryEquipementDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() secteur?: string;
  @IsOptional() @IsEnum(Criticite) criticite?: Criticite;
  @IsOptional() @Type(() => Number) @IsInt() page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() pageSize?: number = 25;
  @IsOptional() @IsString() sortBy?: string = 'designation';
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc' = 'asc';
}
