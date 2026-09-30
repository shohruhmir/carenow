import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { DoctorsModule } from '../doctors/doctors.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DoctorsModule, AuthModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
