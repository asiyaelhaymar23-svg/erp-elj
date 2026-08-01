import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEntreeDto {
  @IsOptional() @Type(() => Number) @IsInt() articleId?: number;
  @IsOptional() @Type(() => Number) @IsInt() equipementId?: number;
  @Type(() => Number) @IsInt() quantite: number;
  @IsDateString() dateEntree: string;
  @IsOptional() @Type(() => Number) @IsInt() fournisseurId?: number;
  @IsOptional() @IsString() otNumero?: string;
}

export class QueryEntreeDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
