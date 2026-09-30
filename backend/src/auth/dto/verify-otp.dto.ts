import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'phone must be in +998XXXXXXXXX format' })
  phone!: string;

  @IsString()
  @Length(4, 4)
  code!: string;
}
