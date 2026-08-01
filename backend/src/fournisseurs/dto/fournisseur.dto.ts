import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFournisseurDto {
  @IsString() nom: string;
  @IsOptional() @IsString() contact?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @Type(() => Number) @IsNumber() notation?: number;
}

export class UpdateFournisseurDto extends CreateFournisseurDto {}

export class QueryFournisseurDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
