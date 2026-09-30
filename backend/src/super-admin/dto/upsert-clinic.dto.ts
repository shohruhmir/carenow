import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class CreateClinicDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase letters, numbers, and hyphens only' })
  slug!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsBoolean()
  is247?: boolean;
}

export class UpdateClinicDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase letters, numbers, and hyphens only' })
  slug?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsBoolean()
  is247?: boolean;
}
