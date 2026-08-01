import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInterventionDto {
  @Type(() => Number) @IsInt() equipementId: number;
  @IsDateString() dateIntervention: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() technicien?: string;
  @IsOptional() @Type(() => Number) @IsNumber() cout?: number;
}

export class UpdateInterventionDto extends CreateInterventionDto {}

export class QueryInterventionDto {
  @IsOptional() @Type(() => Number) @IsInt() equipementId?: number;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
