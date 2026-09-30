import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClinicAdminService } from './clinic-admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ClinicAdminService', () => {
  let service: ClinicAdminService;
  let prisma: { clinic: any; doctor: any; availability: any };

  beforeEach(() => {
    prisma = {
      clinic: { findFirst: jest.fn(), findUnique: jest.fn() },
      doctor: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      availability: { findMany: jest.fn() },
    };
    service = new ClinicAdminService(prisma as unknown as PrismaService);
  });

  it('getMyClinic throws NotFoundException when the user owns no clinic', async () => {
    prisma.clinic.findFirst.mockResolvedValue(null);
    await expect(service.getMyClinic('user-1')).rejects.toThrow(NotFoundException);
  });

  it('addDoctor rejects a branchId that does not belong to the caller clinic', async () => {
    prisma.clinic.findFirst.mockResolvedValue({ id: 'clinic-1', branches: [{ id: 'branch-1' }] });

    await expect(
      service.addDoctor('user-1', { branchId: 'someone-elses-branch', name: 'Dr. X', specialty: 'Ortodont', experienceYrs: 5 }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.doctor.create).not.toHaveBeenCalled();
  });

  it('updateDoctor throws ForbiddenException when the doctor belongs to a different clinic', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doc-1', clinicId: 'other-clinic' });
    prisma.clinic.findUnique.mockResolvedValue({ id: 'other-clinic', ownerId: 'someone-else' });

    await expect(service.updateDoctor('user-1', 'doc-1', { name: 'Hacked' })).rejects.toThrow(ForbiddenException);
    expect(prisma.doctor.update).not.toHaveBeenCalled();
  });

  it('updateDoctor succeeds when the doctor belongs to the caller clinic', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doc-1', clinicId: 'clinic-1' });
    prisma.clinic.findUnique.mockResolvedValue({ id: 'clinic-1', ownerId: 'user-1' });
    prisma.doctor.update.mockResolvedValue({ id: 'doc-1', name: 'Updated' });

    const result = await service.updateDoctor('user-1', 'doc-1', { name: 'Updated' });
    expect(result).toEqual({ id: 'doc-1', name: 'Updated' });
  });

  it('getAvailability throws ForbiddenException when the doctor belongs to a different clinic', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doc-1', clinicId: 'other-clinic' });
    prisma.clinic.findUnique.mockResolvedValue({ id: 'other-clinic', ownerId: 'someone-else' });

    await expect(service.getAvailability('user-1', 'doc-1')).rejects.toThrow(ForbiddenException);
    expect(prisma.availability.findMany).not.toHaveBeenCalled();
  });

  it('getAvailability returns the doctor slots ordered by weekday when the caller owns the clinic', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doc-1', clinicId: 'clinic-1' });
    prisma.clinic.findUnique.mockResolvedValue({ id: 'clinic-1', ownerId: 'user-1' });
    prisma.availability.findMany.mockResolvedValue([{ id: 'a-1', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', slotMinutes: 30 }]);

    const result = await service.getAvailability('user-1', 'doc-1');
    expect(prisma.availability.findMany).toHaveBeenCalledWith({ where: { doctorId: 'doc-1' }, orderBy: { dayOfWeek: 'asc' } });
    expect(result).toEqual([{ id: 'a-1', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', slotMinutes: 30 }]);
  });
});
