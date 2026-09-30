import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  doctorId!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'time must be HH:mm' })
  time!: string;

  @IsOptional()
  @IsString()
  serviceId?: string;
}
