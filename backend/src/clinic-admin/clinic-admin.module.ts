import { Module } from '@nestjs/common';
import { ClinicAdminController } from './clinic-admin.controller';
import { ClinicAdminService } from './clinic-admin.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ClinicAdminController],
  providers: [ClinicAdminService],
})
export class ClinicAdminModule {}
