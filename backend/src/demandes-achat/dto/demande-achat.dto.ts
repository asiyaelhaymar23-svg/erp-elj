import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { NatureBudget } from '@prisma/client';

export class CreateDemandeAchatDto {
  @IsString() numeroDa: string;
  @IsOptional() @IsString() division?: string;
  @IsOptional() @IsString() demandeur?: string;
  @IsOptional() @Type(() => Number) @IsInt() articleId?: number;
  @Type(() => Number) @IsInt() quantite: number;
  @IsDateString() dateCreation: string;
  @IsOptional() @IsDateString() dateValidation?: string;
  @IsOptional() @IsString() statut?: string;
  @IsOptional() @IsString() priorite?: string;
  @IsOptional() @IsEnum(NatureBudget) nature?: NatureBudget;
}

export class UpdateDemandeAchatDto extends CreateDemandeAchatDto {}

export class QueryDemandeAchatDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() statut?: string;
  @IsOptional() @IsString() division?: string;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
