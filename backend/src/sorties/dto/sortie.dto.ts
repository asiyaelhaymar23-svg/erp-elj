import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSortieDto {
  @IsOptional() @Type(() => Number) @IsInt() articleId?: number;
  @IsOptional() @Type(() => Number) @IsInt() equipementId?: number;
  @Type(() => Number) @IsInt() quantite: number;
  @IsDateString() dateSortie: string;
  @IsOptional() @IsDateString() dateRetourPrevue?: string;
  @IsOptional() @IsString() destination?: string;
  @IsOptional() @Type(() => Number) @IsInt() fournisseurId?: number;
  @IsOptional() @IsString() otNumero?: string;
}

export class RetourSortieDto {
  @IsDateString() dateRetourReelle: string;
  @IsOptional() @Type(() => Number) @IsInt() quantiteRetournee?: number;
}

export class QuerySortieDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() statut?: string;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
