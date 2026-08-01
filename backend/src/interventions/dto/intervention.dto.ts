import { IsDate, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export class CreateInterventionDto {
  @Type(() => Number) @IsInt() equipementId: number;
  // @Type(() => Date) plutôt que @IsDateString() : un <input type="date">
  // envoie "2026-01-01" (date seule), que Prisma refuse pour un DateTime.
  @Type(() => Date) @IsDate() dateIntervention: Date;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() technicien?: string;
  @IsOptional() @Type(() => Number) @IsNumber() cout?: number;
}

export class UpdateInterventionDto extends PartialType(CreateInterventionDto) {}

export class QueryInterventionDto {
  @IsOptional() @Type(() => Number) @IsInt() equipementId?: number;
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) pageSize?: number = 25;
}
