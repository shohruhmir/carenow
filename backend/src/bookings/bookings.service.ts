import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DoctorsService } from '../doctors/doctors.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly doctors: DoctorsService,
  ) {}

  async create(patientId: string, dto: { doctorId: string; date: string; time: string; serviceId?: string }) {
    const slots = await this.doctors.availability(dto.doctorId, dto.date);
    const slot = slots.find((s) => s.time === dto.time);

    if (!slot) {
      throw new BadRequestException("Requested time is outside the doctor's schedule for that day");
    }
    if (!slot.available) {
      throw new ConflictException('That slot is already booked');
    }

    try {
      return await this.prisma.booking.create({
        data: {
          patientId,
          doctorId: dto.doctorId,
          date: new Date(dto.date),
          time: dto.time,
          serviceId: dto.serviceId,
        },
        include: { doctor: { include: { clinic: true, branch: true } } },
      });
    } catch (err) {
      // Race condition: two requests for the same doctor+date+time landed
      // between the availability check above and this insert.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('That slot is already booked');
      }
      throw err;
    }
  }

  async findMine(patientId: string) {
    return this.prisma.booking.findMany({
      where: { patientId },
      include: { doctor: { include: { clinic: true, branch: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async cancel(patientId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.patientId !== patientId) throw new ForbiddenException('Not your booking');

    return this.prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });
  }
}
