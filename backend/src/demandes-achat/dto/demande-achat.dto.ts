import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { NatureBudget } from '@prisma/client';

export class CreateDemandeAchatDto {
  @IsString() numeroDa: string;
  @IsOptional() @IsString() division?: string;
  @IsOptional() @IsString() demandeur?: string;
  @IsOptional() @Type(() => Number) @IsInt() articleId?: number;
  @Type(() => Number) @IsInt() quantite: number;
  // @Type(() => Date) plutôt que @IsDateString() : un <input type="date">
  // envoie "2026-01-01" (date seule), que Prisma refuse pour un DateTime.
  @Type(() => Date) @IsDate() dateCreation: Date;
  @IsOptional() @Type(() => Date) @IsDate() dateValidation?: Date;
  @IsOptional() @IsString() statut?: string;
  @IsOptional() @IsString() priorite?: string;
  @IsOptional() @IsEnum(NatureBudget) nature?: NatureBudget;
}

// PartialType (et non `extends CreateDemandeAchatDto {}`) : un PATCH doit
// pouvoir n'envoyer qu'un sous-ensemble des champs (ex. valider une DA en
// ne modifiant que dateValidation) sans échouer la validation des champs
// requis de la création.
export class UpdateDemandeAchatDto extends PartialType(CreateDemandeAchatDto) {}

export class QueryDemandeAchatDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() statut?: string;
  @IsOptional() @IsString() division?: string;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
