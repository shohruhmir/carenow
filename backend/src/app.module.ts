import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DoctorsModule } from './doctors/doctors.module';
import { ClinicsModule } from './clinics/clinics.module';
import { BookingsModule } from './bookings/bookings.module';
import { ClinicAdminModule } from './clinic-admin/clinic-admin.module';
import { DoctorPortalModule } from './doctor-portal/doctor-portal.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { FavoritesModule } from './favorites/favorites.module';
import { BusinessModule } from './business/business.module';
import { ContentModule } from './content/content.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DoctorsModule,
    ClinicsModule,
    BookingsModule,
    ClinicAdminModule,
    DoctorPortalModule,
    SuperAdminModule,
    FavoritesModule,
    BusinessModule,
    ContentModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
