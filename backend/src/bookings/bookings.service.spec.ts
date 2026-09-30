import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { DoctorsService } from '../doctors/doctors.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: { booking: any };
  let doctors: { availability: jest.Mock };

  beforeEach(() => {
    prisma = { booking: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() } };
    doctors = { availability: jest.fn() };
    service = new BookingsService(prisma as unknown as PrismaService, doctors as unknown as DoctorsService);
  });

  it('rejects a time outside the doctor schedule for that date', async () => {
    doctors.availability.mockResolvedValue([{ time: '09:00', available: true }]);

    await expect(service.create('patient-1', { doctorId: 'doc-1', date: '2026-08-10', time: '11:00' })).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it('rejects a time that is already booked', async () => {
    doctors.availability.mockResolvedValue([{ time: '09:00', available: false }]);

    await expect(service.create('patient-1', { doctorId: 'doc-1', date: '2026-08-10', time: '09:00' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('creates a booking when the slot is valid and open', async () => {
    doctors.availability.mockResolvedValue([{ time: '09:00', available: true }]);
    prisma.booking.create.mockResolvedValue({ id: 'booking-1' });

    const result = await service.create('patient-1', { doctorId: 'doc-1', date: '2026-08-10', time: '09:00' });

    expect(result).toEqual({ id: 'booking-1' });
    expect(prisma.booking.create).toHaveBeenCalled();
  });

  it('cancel throws ForbiddenException when the booking belongs to someone else', async () => {
    prisma.booking.findUnique.mockResolvedValue({ id: 'b1', patientId: 'other-patient' });

    await expect(service.cancel('patient-1', 'b1')).rejects.toThrow(ForbiddenException);
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  it('cancel throws NotFoundException when the booking does not exist', async () => {
    prisma.booking.findUnique.mockResolvedValue(null);
    await expect(service.cancel('patient-1', 'missing')).rejects.toThrow(NotFoundException);
  });
});
