import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommandeDto {
  @IsString() numeroBc: string;
  @IsOptional() @Type(() => Number) @IsInt() demandeAchatId?: number;
  @IsOptional() @Type(() => Number) @IsInt() fournisseurId?: number;
  @IsOptional() @Type(() => Number) @IsNumber() montant?: number;
  @IsDateString() dateCommande: string;
  @IsOptional() @IsDateString() dateReception?: string;
  @IsOptional() @IsString() statut?: string;
}

export class UpdateCommandeDto extends CreateCommandeDto {}

export class QueryCommandeDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() statut?: string;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
