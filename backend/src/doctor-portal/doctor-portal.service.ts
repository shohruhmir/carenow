import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilitySlotDto } from '../clinic-admin/dto/set-availability.dto';

@Injectable()
export class DoctorPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: { clinic: true, branch: true },
    });
    if (!doctor) throw new NotFoundException('No doctor profile is linked to this account yet');
    return doctor;
  }

  async getMyAvailability(userId: string) {
    const doctor = await this.getMyProfile(userId);
    return this.prisma.availability.findMany({ where: { doctorId: doctor.id }, orderBy: { dayOfWeek: 'asc' } });
  }

  async setMyAvailability(userId: string, slots: AvailabilitySlotDto[]) {
    const doctor = await this.getMyProfile(userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({ where: { doctorId: doctor.id } });
      await tx.availability.createMany({ data: slots.map((s) => ({ ...s, doctorId: doctor.id })) });
      return tx.availability.findMany({ where: { doctorId: doctor.id }, orderBy: { dayOfWeek: 'asc' } });
    });
  }

  async getMyBookings(userId: string) {
    const doctor = await this.getMyProfile(userId);

    return this.prisma.booking.findMany({
      where: { doctorId: doctor.id },
      include: { patient: { select: { id: true, phone: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }
}
