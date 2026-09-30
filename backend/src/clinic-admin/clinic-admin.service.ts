import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/upsert-doctor.dto';
import { AvailabilitySlotDto } from './dto/set-availability.dto';

@Injectable()
export class ClinicAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyClinic(userId: string) {
    const clinic = await this.prisma.clinic.findFirst({
      where: { ownerId: userId },
      include: { branches: true, doctors: true },
    });
    if (!clinic) throw new NotFoundException('No clinic is linked to this account yet');
    return clinic;
  }

  private async assertOwnDoctor(userId: string, doctorId: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const clinic = await this.prisma.clinic.findUnique({ where: { id: doctor.clinicId } });
    if (clinic?.ownerId !== userId) throw new ForbiddenException("Not your clinic's doctor");

    return doctor;
  }

  async addDoctor(userId: string, dto: CreateDoctorDto) {
    const clinic = await this.getMyClinic(userId);

    const branchBelongsToClinic = clinic.branches.some((b) => b.id === dto.branchId);
    if (!branchBelongsToClinic) {
      throw new BadRequestException("branchId must belong to your clinic");
    }

    return this.prisma.doctor.create({
      data: { clinicId: clinic.id, branchId: dto.branchId, name: dto.name, specialty: dto.specialty, experienceYrs: dto.experienceYrs },
    });
  }

  async updateDoctor(userId: string, doctorId: string, dto: UpdateDoctorDto) {
    await this.assertOwnDoctor(userId, doctorId);

    if (dto.branchId) {
      const clinic = await this.getMyClinic(userId);
      if (!clinic.branches.some((b) => b.id === dto.branchId)) {
        throw new BadRequestException('branchId must belong to your clinic');
      }
    }

    return this.prisma.doctor.update({ where: { id: doctorId }, data: dto });
  }

  async removeDoctor(userId: string, doctorId: string) {
    await this.assertOwnDoctor(userId, doctorId);

    try {
      await this.prisma.doctor.delete({ where: { id: doctorId } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Cannot remove a doctor with existing bookings');
      }
      throw err;
    }
    return { removed: true };
  }

  async getAvailability(userId: string, doctorId: string) {
    await this.assertOwnDoctor(userId, doctorId);
    return this.prisma.availability.findMany({ where: { doctorId }, orderBy: { dayOfWeek: 'asc' } });
  }

  async setAvailability(userId: string, doctorId: string, slots: AvailabilitySlotDto[]) {
    await this.assertOwnDoctor(userId, doctorId);

    return this.prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({ where: { doctorId } });
      await tx.availability.createMany({ data: slots.map((s) => ({ ...s, doctorId })) });
      return tx.availability.findMany({ where: { doctorId } });
    });
  }

  async getMyBookings(userId: string) {
    const clinic = await this.getMyClinic(userId);

    return this.prisma.booking.findMany({
      where: { doctor: { clinicId: clinic.id } },
      include: { doctor: true, patient: { select: { id: true, phone: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }
}
