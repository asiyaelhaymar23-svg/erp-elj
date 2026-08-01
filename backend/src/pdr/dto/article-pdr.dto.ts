import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { Criticite, StatutStock } from '@prisma/client';

export class CreateArticlePdrDto {
  @IsString() codeSap: string;
  @IsString() designation: string;
  @IsOptional() @IsString() marque?: string;
  @IsOptional() @IsString() fabricant?: string;
  @IsOptional() @IsString() referenceConstructeur?: string;
  @IsOptional() @IsString() famille?: string;
  @IsOptional() @IsString() sousFamille?: string;
  @IsOptional() @IsString() unite?: string;
  @IsOptional() @IsString() magasin?: string;
  @IsOptional() @Type(() => Number) @IsInt() stockMin?: number;
  @IsOptional() @Type(() => Number) @IsInt() stockMax?: number;
  @IsOptional() @Type(() => Number) @IsInt() stockActuel?: number;
  @IsOptional() @Type(() => Number) @IsNumber() prixUnitaire?: number;
  @IsOptional() @IsEnum(Criticite) classeAbc?: Criticite;
  @IsOptional() @IsBoolean() critique?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() fournisseurId?: number;
  @IsOptional() @Type(() => Number) @IsInt() equipementId?: number;
}

export class UpdateArticlePdrDto extends PartialType(CreateArticlePdrDto) {}

export class QueryArticlePdrDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(StatutStock) statut?: StatutStock;
  @IsOptional() @IsEnum(Criticite) classeAbc?: Criticite;
  @IsOptional() @Type(() => Number) @IsInt() page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() pageSize?: number = 25;
}
