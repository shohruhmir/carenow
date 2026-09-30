import { NotFoundException } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let prisma: { doctor: any; booking: any };

  beforeEach(() => {
    prisma = { doctor: { findMany: jest.fn(), findUnique: jest.fn() }, booking: { findMany: jest.fn() } };
    service = new DoctorsService(prisma as unknown as PrismaService);
  });

  it('findOne throws NotFoundException when the doctor does not exist', async () => {
    prisma.doctor.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('availability excludes already-booked times for that date', async () => {
    prisma.doctor.findUnique.mockResolvedValue({
      id: 'doc-1',
      availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:00', slotMinutes: 30 }],
    });
    prisma.booking.findMany.mockResolvedValue([{ time: '09:30' }]);

    // 2026-08-10 is a Monday (dayOfWeek 1)
    const result = await service.availability('doc-1', '2026-08-10');

    expect(result).toEqual([
      { time: '09:00', available: true },
      { time: '09:30', available: false },
    ]);
  });

  it('availability returns no slots for a day the doctor has no availability rows for', async () => {
    prisma.doctor.findUnique.mockResolvedValue({
      id: 'doc-1',
      availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:00', slotMinutes: 30 }],
    });
    prisma.booking.findMany.mockResolvedValue([]);

    // 2026-08-09 is a Sunday (dayOfWeek 0) — no matching availability row
    const result = await service.availability('doc-1', '2026-08-09');

    expect(result).toEqual([]);
  });
});
