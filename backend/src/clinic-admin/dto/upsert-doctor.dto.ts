import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  branchId!: string;

  @IsString()
  name!: string;

  @IsString()
  specialty!: string;

  @IsInt()
  @Min(0)
  experienceYrs!: number;
}

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYrs?: number;
}
