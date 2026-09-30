import { Module } from '@nestjs/common';
import { DoctorPortalController } from './doctor-portal.controller';
import { DoctorPortalService } from './doctor-portal.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DoctorPortalController],
  providers: [DoctorPortalService],
})
export class DoctorPortalModule {}
