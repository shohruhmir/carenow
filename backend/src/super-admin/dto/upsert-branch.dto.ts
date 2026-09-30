import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsString()
  phone!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

export class UpdateBranchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
