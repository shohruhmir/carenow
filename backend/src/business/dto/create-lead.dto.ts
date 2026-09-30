import { IsString, MinLength } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @MinLength(2)
  clinicName!: string;

  @IsString()
  city!: string;

  @IsString()
  branchCount!: string;

  @IsString()
  @MinLength(9)
  phone!: string;
}
