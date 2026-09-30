import { NotFoundException } from '@nestjs/common';
import { DoctorPortalService } from './doctor-portal.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DoctorPortalService', () => {
  let service: DoctorPortalService;
  let prisma: { doctor: any; availability: any; booking: any; $transaction: any };

  beforeEach(() => {
    prisma = {
      doctor: { findUnique: jest.fn() },
      availability: { findMany: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn() },
      booking: { findMany: jest.fn() },
      $transaction: jest.fn(async (fn: any) => fn(prisma)),
    };
    service = new DoctorPortalService(prisma as unknown as PrismaService);
  });

  it('getMyProfile throws NotFoundException when no doctor is linked to the user', async () => {
    prisma.doctor.findUnique.mockResolvedValue(null);
    await expect(service.getMyProfile('user-1')).rejects.toThrow(NotFoundException);
  });

  it('getMyProfile returns the linked doctor with clinic and branch', async () => {
    const doctor = { id: 'doc-1', userId: 'user-1', clinic: { id: 'clinic-1' }, branch: { id: 'branch-1' } };
    prisma.doctor.findUnique.mockResolvedValue(doctor);

    const result = await service.getMyProfile('user-1');
    expect(prisma.doctor.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-1' }, include: { clinic: true, branch: true } });
    expect(result).toEqual(doctor);
  });

  it('getMyAvailability returns slots for the linked doctor', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doc-1' });
    prisma.availability.findMany.mockResolvedValue([{ id: 'a-1', dayOfWeek: 1 }]);

    const result = await service.getMyAvailability('user-1');
    expect(prisma.availability.findMany).toHaveBeenCalledWith({ where: { doctorId: 'doc-1' }, orderBy: { dayOfWeek: 'asc' } });
    expect(result).toEqual([{ id: 'a-1', dayOfWeek: 1 }]);
  });

  it('setMyAvailability replaces the slots for the linked doctor', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doc-1' });
    prisma.availability.findMany.mockResolvedValue([{ id: 'a-1', dayOfWeek: 1 }]);
    const slots = [{ dayOfWeek: 1, startTime: '09:00', endTime: '18:00', slotMinutes: 30 }];

    const result = await service.setMyAvailability('user-1', slots);
    expect(prisma.availability.deleteMany).toHaveBeenCalledWith({ where: { doctorId: 'doc-1' } });
    expect(prisma.availability.createMany).toHaveBeenCalledWith({ data: [{ ...slots[0], doctorId: 'doc-1' }] });
    expect(result).toEqual([{ id: 'a-1', dayOfWeek: 1 }]);
  });

  it('getMyBookings returns bookings for the linked doctor with patient info', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doc-1' });
    prisma.booking.findMany.mockResolvedValue([{ id: 'b-1', doctorId: 'doc-1' }]);

    const result = await service.getMyBookings('user-1');
    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: { doctorId: 'doc-1' },
      include: { patient: { select: { id: true, phone: true, name: true } } },
      orderBy: { date: 'desc' },
    });
    expect(result).toEqual([{ id: 'b-1', doctorId: 'doc-1' }]);
  });
});
