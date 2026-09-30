import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { specialty?: string; city?: string; q?: string }) {
    const { specialty, q } = params;

    return this.prisma.doctor.findMany({
      where: {
        ...(specialty ? { specialty: { equals: specialty, mode: 'insensitive' } } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { specialty: { contains: q, mode: 'insensitive' } }] } : {}),
      },
      include: { clinic: true, branch: true },
      orderBy: { rating: 'desc' },
    });
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { clinic: true, branch: true, availability: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async availability(id: string, date: string) {
    const doctor = await this.findOne(id);
    const dayOfWeek = new Date(date).getDay();

    const slotsForDay = doctor.availability.filter((a) => a.dayOfWeek === dayOfWeek);
    const times = slotsForDay.flatMap((a) => generateTimes(a.startTime, a.endTime, a.slotMinutes));

    const booked = await this.prisma.booking.findMany({
      where: { doctorId: id, date: new Date(date), status: { not: 'CANCELLED' } },
      select: { time: true },
    });
    const bookedTimes = new Set(booked.map((b) => b.time));

    return times.map((time) => ({ time, available: !bookedTimes.has(time) }));
  }
}

function generateTimes(start: string, end: string, stepMinutes: number): string[] {
  const times: string[] = [];
  let [h, m] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  while (h < endH || (h === endH && m < endM)) {
    times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += stepMinutes;
    if (m >= 60) {
      m -= 60;
      h += 1;
    }
  }
  return times;
}
