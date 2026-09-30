import { IsOptional, IsString } from 'class-validator';

export class UpdateContentDto {
  @IsOptional()
  @IsString()
  uz?: string;

  @IsOptional()
  @IsString()
  ru?: string;

  @IsOptional()
  @IsString()
  en?: string;
}
