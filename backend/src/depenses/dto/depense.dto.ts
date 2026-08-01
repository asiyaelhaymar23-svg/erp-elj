import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { NatureBudget, TypeDepense } from '@prisma/client';

export class CreateDepenseDto {
  @IsString() secteur: string;
  @IsEnum(NatureBudget) nature: NatureBudget;
  @IsEnum(TypeDepense) type: TypeDepense;
  @IsOptional() @Type(() => Number) @IsInt() articleId?: number;
  @Type(() => Number) @IsNumber() montant: number;
  @IsOptional() @IsString() pilote?: string;
  @IsOptional() @IsString() otNumero?: string;
  @IsOptional() @Type(() => Number) @IsInt() fournisseurId?: number;
  @IsOptional() @IsString() statut?: string;
}

export class UpdateDepenseDto extends PartialType(CreateDepenseDto) {}

export class QueryDepenseDto {
  @IsOptional() @IsString() secteur?: string;
  @IsOptional() @IsEnum(NatureBudget) nature?: NatureBudget;
  @IsOptional() @IsEnum(TypeDepense) type?: TypeDepense;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
