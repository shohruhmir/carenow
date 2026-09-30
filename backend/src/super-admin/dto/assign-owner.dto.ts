import { IsString, Matches } from 'class-validator';

export class AssignOwnerDto {
  @IsString()
  @Matches(/^\+?\d{9,15}$/, { message: 'phone must be a valid phone number' })
  phone!: string;
}
