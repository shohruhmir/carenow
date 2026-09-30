import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/upsert-service.dto';
import { CreateClinicDto, UpdateClinicDto } from './dto/upsert-clinic.dto';
import { CreateBranchDto, UpdateBranchDto } from './dto/upsert-branch.dto';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/upsert-doctor.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { ContentService } from '../content/content.service';
import { UpdateContentDto } from '../content/dto/update-content.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
  ) {}

  async getStats() {
    const [clinics, branches, doctors, bookings, leads, patients, clinicAdmins] = await Promise.all([
      this.prisma.clinic.count(),
      this.prisma.branch.count(),
      this.prisma.doctor.count(),
      this.prisma.booking.count(),
      this.prisma.businessLead.count(),
      this.prisma.user.count({ where: { role: 'PATIENT' } }),
      this.prisma.user.count({ where: { role: 'CLINIC_ADMIN' } }),
    ]);
    return { clinics, branches, doctors, bookings, leads, patients, clinicAdmins };
  }

  async listClinics() {
    return this.prisma.clinic.findMany({
      include: {
        owner: { select: { id: true, phone: true, name: true } },
        branches: { orderBy: { name: 'asc' } },
        _count: { select: { branches: true, doctors: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createClinic(dto: CreateClinicDto) {
    try {
      return await this.prisma.clinic.create({ data: dto });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('A clinic with this slug already exists');
      }
      throw err;
    }
  }

  async updateClinic(id: string, dto: UpdateClinicDto) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id } });
    if (!clinic) throw new NotFoundException('Clinic not found');

    try {
      return await this.prisma.clinic.update({ where: { id }, data: dto });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('A clinic with this slug already exists');
      }
      throw err;
    }
  }

  async removeClinic(id: string) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id } });
    if (!clinic) throw new NotFoundException('Clinic not found');

    const [branches, doctors, services] = await Promise.all([
      this.prisma.branch.count({ where: { clinicId: id } }),
      this.prisma.doctor.count({ where: { clinicId: id } }),
      this.prisma.service.count({ where: { clinicId: id } }),
    ]);
    if (branches || doctors || services) {
      const parts = [
        branches ? `${branches} branch(es)` : null,
        doctors ? `${doctors} doctor(s)` : null,
        services ? `${services} service(s)` : null,
      ].filter(Boolean);
      throw new ConflictException(`Remove these first: ${parts.join(', ')}`);
    }

    await this.prisma.clinic.delete({ where: { id } });
    return { removed: true };
  }

  async createBranch(clinicId: string, dto: CreateBranchDto) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) throw new NotFoundException('Clinic not found');

    return this.prisma.branch.create({ data: { ...dto, clinicId } });
  }

  async updateBranch(id: string, dto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');

    return this.prisma.branch.update({ where: { id }, data: dto });
  }

  async removeBranch(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');

    try {
      await this.prisma.branch.delete({ where: { id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Cannot remove a branch with doctors assigned to it');
      }
      throw err;
    }
    return { removed: true };
  }

  async assignClinicOwner(clinicId: string, phone: string) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) throw new NotFoundException('Clinic not found');

    const owner = await this.prisma.user.upsert({
      where: { phone },
      update: { role: 'CLINIC_ADMIN' },
      create: { phone, role: 'CLINIC_ADMIN' },
    });

    return this.prisma.clinic.update({
      where: { id: clinicId },
      data: { ownerId: owner.id },
      include: { owner: { select: { id: true, phone: true, name: true } } },
    });
  }

  async listLeads() {
    return this.prisma.businessLead.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async removeLead(id: string) {
    const lead = await this.prisma.businessLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    await this.prisma.businessLead.delete({ where: { id } });
    return { removed: true };
  }

  async listUsers() {
    return this.prisma.user.findMany({
      select: { id: true, phone: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUser(callerId: string, id: string, dto: UpdateUserDto) {
    if (id === callerId) throw new ForbiddenException('Cannot edit your own account here');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { name: dto.name },
      select: { id: true, phone: true, name: true, role: true, createdAt: true },
    });
  }

  async removeUser(callerId: string, id: string) {
    if (id === callerId) throw new ForbiddenException('Cannot delete your own account');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const [bookings, ownedClinics, doctorProfile] = await Promise.all([
      this.prisma.booking.count({ where: { patientId: id } }),
      this.prisma.clinic.count({ where: { ownerId: id } }),
      this.prisma.doctor.count({ where: { userId: id } }),
    ]);
    if (bookings || ownedClinics || doctorProfile) {
      const parts = [
        bookings ? `${bookings} booking(s)` : null,
        ownedClinics ? `${ownedClinics} owned clinic(s)` : null,
        doctorProfile ? `${doctorProfile} linked doctor profile(s)` : null,
      ].filter(Boolean);
      throw new ConflictException(`Remove these first: ${parts.join(', ')}`);
    }

    await this.prisma.user.delete({ where: { id } });
    return { removed: true };
  }

  async listBookings() {
    return this.prisma.booking.findMany({
      include: {
        patient: { select: { id: true, phone: true, name: true } },
        doctor: { select: { id: true, name: true, clinic: { select: { id: true, name: true } } } },
      },
      orderBy: { date: 'desc' },
      take: 200,
    });
  }

  async updateBookingStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.booking.update({ where: { id }, data: { status: dto.status } });
  }

  async listServices() {
    return this.prisma.service.findMany({
      include: { clinic: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createService(dto: CreateServiceDto) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id: dto.clinicId } });
    if (!clinic) throw new NotFoundException('Clinic not found');

    return this.prisma.service.create({ data: dto });
  }

  async updateService(id: string, dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');

    if (dto.clinicId) {
      const clinic = await this.prisma.clinic.findUnique({ where: { id: dto.clinicId } });
      if (!clinic) throw new NotFoundException('Clinic not found');
    }

    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async removeService(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');

    await this.prisma.service.delete({ where: { id } });
    return { removed: true };
  }

  async listDoctors() {
    return this.prisma.doctor.findMany({
      include: { clinic: { select: { id: true, name: true } }, branch: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  private async assertBranchBelongsToClinic(branchId: string, clinicId: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch || branch.clinicId !== clinicId) {
      throw new BadRequestException('branchId must belong to clinicId');
    }
  }

  async createDoctor(dto: CreateDoctorDto) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id: dto.clinicId } });
    if (!clinic) throw new NotFoundException('Clinic not found');

    await this.assertBranchBelongsToClinic(dto.branchId, dto.clinicId);

    return this.prisma.doctor.create({
      data: { clinicId: dto.clinicId, branchId: dto.branchId, name: dto.name, specialty: dto.specialty, experienceYrs: dto.experienceYrs },
    });
  }

  async updateDoctor(id: string, dto: UpdateDoctorDto) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (dto.clinicId || dto.branchId) {
      const clinicId = dto.clinicId ?? doctor.clinicId;
      const branchId = dto.branchId ?? doctor.branchId;
      const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId } });
      if (!clinic) throw new NotFoundException('Clinic not found');
      await this.assertBranchBelongsToClinic(branchId, clinicId);
    }

    return this.prisma.doctor.update({ where: { id }, data: dto });
  }

  async removeDoctor(id: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    try {
      await this.prisma.doctor.delete({ where: { id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Cannot remove a doctor with existing bookings');
      }
      throw err;
    }
    return { removed: true };
  }

  async listContent() {
    return this.content.listAll();
  }

  async updateContent(id: string, dto: UpdateContentDto) {
    return this.content.update(id, dto);
  }
}
