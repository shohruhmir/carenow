import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClinicAdminService } from './clinic-admin.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/upsert-doctor.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt-auth.guard';

@Controller('admin/clinic')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLINIC_ADMIN')
export class ClinicAdminController {
  constructor(private readonly clinicAdmin: ClinicAdminService) {}

  @Get()
  getMyClinic(@CurrentUser() user: JwtPayload) {
    return this.clinicAdmin.getMyClinic(user.sub);
  }

  @Post('doctors')
  addDoctor(@CurrentUser() user: JwtPayload, @Body() dto: CreateDoctorDto) {
    return this.clinicAdmin.addDoctor(user.sub, dto);
  }

  @Patch('doctors/:id')
  updateDoctor(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateDoctorDto) {
    return this.clinicAdmin.updateDoctor(user.sub, id, dto);
  }

  @Delete('doctors/:id')
  removeDoctor(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.clinicAdmin.removeDoctor(user.sub, id);
  }

  @Get('doctors/:id/availability')
  getAvailability(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.clinicAdmin.getAvailability(user.sub, id);
  }

  @Post('doctors/:id/availability')
  setAvailability(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: SetAvailabilityDto) {
    return this.clinicAdmin.setAvailability(user.sub, id, dto.slots);
  }

  @Get('bookings')
  getMyBookings(@CurrentUser() user: JwtPayload) {
    return this.clinicAdmin.getMyBookings(user.sub);
  }
}
