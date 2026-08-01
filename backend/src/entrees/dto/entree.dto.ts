import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEntreeDto {
  @IsOptional() @Type(() => Number) @IsInt() articleId?: number;
  @IsOptional() @Type(() => Number) @IsInt() equipementId?: number;
  @Type(() => Number) @IsInt() quantite: number;
  // @Type(() => Date) plutôt que @IsDateString() : un <input type="date">
  // envoie "2026-01-01" (date seule), que Prisma refuse pour un DateTime.
  @Type(() => Date) @IsDate() dateEntree: Date;
  @IsOptional() @Type(() => Number) @IsInt() fournisseurId?: number;
  @IsOptional() @IsString() otNumero?: string;
}

export class QueryEntreeDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
