import { Module } from '@nestjs/common';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { AuthModule } from '../auth/auth.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [AuthModule, ContentModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}
