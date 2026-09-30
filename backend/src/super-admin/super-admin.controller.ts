import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { AssignOwnerDto } from './dto/assign-owner.dto';
import { CreateServiceDto, UpdateServiceDto } from './dto/upsert-service.dto';
import { CreateClinicDto, UpdateClinicDto } from './dto/upsert-clinic.dto';
import { CreateBranchDto, UpdateBranchDto } from './dto/upsert-branch.dto';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/upsert-doctor.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdateContentDto } from '../content/dto/update-content.dto';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class SuperAdminController {
  constructor(private readonly superAdmin: SuperAdminService) {}

  @Get('stats')
  getStats() {
    return this.superAdmin.getStats();
  }

  @Get('clinics')
  listClinics() {
    return this.superAdmin.listClinics();
  }

  @Patch('clinics/:id/owner')
  assignClinicOwner(@Param('id') id: string, @Body() dto: AssignOwnerDto) {
    return this.superAdmin.assignClinicOwner(id, dto.phone);
  }

  @Post('clinics')
  createClinic(@Body() dto: CreateClinicDto) {
    return this.superAdmin.createClinic(dto);
  }

  @Patch('clinics/:id')
  updateClinic(@Param('id') id: string, @Body() dto: UpdateClinicDto) {
    return this.superAdmin.updateClinic(id, dto);
  }

  @Delete('clinics/:id')
  removeClinic(@Param('id') id: string) {
    return this.superAdmin.removeClinic(id);
  }

  @Post('clinics/:clinicId/branches')
  createBranch(@Param('clinicId') clinicId: string, @Body() dto: CreateBranchDto) {
    return this.superAdmin.createBranch(clinicId, dto);
  }

  @Patch('branches/:id')
  updateBranch(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.superAdmin.updateBranch(id, dto);
  }

  @Delete('branches/:id')
  removeBranch(@Param('id') id: string) {
    return this.superAdmin.removeBranch(id);
  }

  @Get('leads')
  listLeads() {
    return this.superAdmin.listLeads();
  }

  @Delete('leads/:id')
  removeLead(@Param('id') id: string) {
    return this.superAdmin.removeLead(id);
  }

  @Get('users')
  listUsers() {
    return this.superAdmin.listUsers();
  }

  @Patch('users/:id')
  updateUser(@CurrentUser() caller: JwtPayload, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.superAdmin.updateUser(caller.sub, id, dto);
  }

  @Delete('users/:id')
  removeUser(@CurrentUser() caller: JwtPayload, @Param('id') id: string) {
    return this.superAdmin.removeUser(caller.sub, id);
  }

  @Get('bookings')
  listBookings() {
    return this.superAdmin.listBookings();
  }

  @Patch('bookings/:id/status')
  updateBookingStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.superAdmin.updateBookingStatus(id, dto);
  }

  @Get('services')
  listServices() {
    return this.superAdmin.listServices();
  }

  @Post('services')
  createService(@Body() dto: CreateServiceDto) {
    return this.superAdmin.createService(dto);
  }

  @Patch('services/:id')
  updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.superAdmin.updateService(id, dto);
  }

  @Delete('services/:id')
  removeService(@Param('id') id: string) {
    return this.superAdmin.removeService(id);
  }

  @Get('doctors')
  listDoctors() {
    return this.superAdmin.listDoctors();
  }

  @Post('doctors')
  createDoctor(@Body() dto: CreateDoctorDto) {
    return this.superAdmin.createDoctor(dto);
  }

  @Patch('doctors/:id')
  updateDoctor(@Param('id') id: string, @Body() dto: UpdateDoctorDto) {
    return this.superAdmin.updateDoctor(id, dto);
  }

  @Delete('doctors/:id')
  removeDoctor(@Param('id') id: string) {
    return this.superAdmin.removeDoctor(id);
  }

  @Get('content')
  listContent() {
    return this.superAdmin.listContent();
  }

  @Patch('content/:id')
  updateContent(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.superAdmin.updateContent(id, dto);
  }
}
