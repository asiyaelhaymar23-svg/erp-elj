import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateParametreDto {
  @IsString() type: string; // "FAMILLE" | "SOUS_FAMILLE" | "SECTEUR" | "MARQUE" | "CONSTRUCTEUR" |
                              // "MAGASIN" | "TYPE_MRP" | "UNITE" | "CENTRE_COUT" | "SERVICE" | "CATEGORIE" | "STATUT"
  @IsString() valeur: string;
  @IsOptional() @Type(() => Number) @IsInt() ordre?: number;
}

export class UpdateParametreDto {
  @IsOptional() @IsString() valeur?: string;
  @IsOptional() @Type(() => Number) @IsInt() ordre?: number;
  @IsOptional() @IsBoolean() actif?: boolean;
}
