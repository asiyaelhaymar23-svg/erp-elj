import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSortieDto {
  @IsOptional() @Type(() => Number) @IsInt() articleId?: number;
  @IsOptional() @Type(() => Number) @IsInt() equipementId?: number;
  @Type(() => Number) @IsInt() quantite: number;
  // @Type(() => Date) plutôt que @IsDateString() : un <input type="date">
  // envoie "2026-01-01" (date seule), que Prisma refuse pour un DateTime.
  @Type(() => Date) @IsDate() dateSortie: Date;
  @IsOptional() @Type(() => Date) @IsDate() dateRetourPrevue?: Date;
  @IsOptional() @IsString() destination?: string;
  @IsOptional() @Type(() => Number) @IsInt() fournisseurId?: number;
  @IsOptional() @IsString() otNumero?: string;
}

export class RetourSortieDto {
  @Type(() => Date) @IsDate() dateRetourReelle: Date;
  @IsOptional() @Type(() => Number) @IsInt() quantiteRetournee?: number;
}

export class QuerySortieDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() statut?: string;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
