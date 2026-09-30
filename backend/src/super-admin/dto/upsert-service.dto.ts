import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  clinicId!: string;

  @IsString()
  name!: string;

  @IsInt()
  @Min(0)
  price!: number;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  clinicId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}
