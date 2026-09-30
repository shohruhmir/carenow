import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DoctorPortalService } from './doctor-portal.service';
import { SetAvailabilityDto } from '../clinic-admin/dto/set-availability.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt-auth.guard';

@Controller('doctor-portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class DoctorPortalController {
  constructor(private readonly doctorPortal: DoctorPortalService) {}

  @Get('me')
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.doctorPortal.getMyProfile(user.sub);
  }

  @Get('availability')
  getMyAvailability(@CurrentUser() user: JwtPayload) {
    return this.doctorPortal.getMyAvailability(user.sub);
  }

  @Post('availability')
  setMyAvailability(@CurrentUser() user: JwtPayload, @Body() dto: SetAvailabilityDto) {
    return this.doctorPortal.setMyAvailability(user.sub, dto.slots);
  }

  @Get('bookings')
  getMyBookings(@CurrentUser() user: JwtPayload) {
    return this.doctorPortal.getMyBookings(user.sub);
  }
}
