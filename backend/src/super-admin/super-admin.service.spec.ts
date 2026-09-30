import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SuperAdminService } from './super-admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { ContentService } from '../content/content.service';

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('mock', { code, clientVersion: '5.22.0' });
}

describe('SuperAdminService', () => {
  let service: SuperAdminService;
  let prisma: { clinic: any; user: any; branch: any; doctor: any; booking: any; businessLead: any; service: any };
  let content: { listAll: jest.Mock; update: jest.Mock };

  beforeEach(() => {
    prisma = {
      clinic: { findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn(), create: jest.fn(), delete: jest.fn() },
      user: { upsert: jest.fn(), count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
      branch: { count: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), findUnique: jest.fn() },
      doctor: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      booking: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      businessLead: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
      service: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    };
    content = { listAll: jest.fn(), update: jest.fn() };
    service = new SuperAdminService(prisma as unknown as PrismaService, content as unknown as ContentService);
  });

  it('assignClinicOwner throws NotFoundException when the clinic does not exist', async () => {
    prisma.clinic.findUnique.mockResolvedValue(null);
    await expect(service.assignClinicOwner('clinic-1', '+998900000009')).rejects.toThrow(NotFoundException);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  it('assignClinicOwner upserts a CLINIC_ADMIN user by phone and sets them as the clinic owner', async () => {
    prisma.clinic.findUnique.mockResolvedValue({ id: 'clinic-1' });
    prisma.user.upsert.mockResolvedValue({ id: 'user-1', phone: '+998900000009', role: 'CLINIC_ADMIN' });
    prisma.clinic.update.mockResolvedValue({ id: 'clinic-1', ownerId: 'user-1' });

    const result = await service.assignClinicOwner('clinic-1', '+998900000009');
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { phone: '+998900000009' },
      update: { role: 'CLINIC_ADMIN' },
      create: { phone: '+998900000009', role: 'CLINIC_ADMIN' },
    });
    expect(prisma.clinic.update).toHaveBeenCalledWith({
      where: { id: 'clinic-1' },
      data: { ownerId: 'user-1' },
      include: { owner: { select: { id: true, phone: true, name: true } } },
    });
    expect(result).toEqual({ id: 'clinic-1', ownerId: 'user-1' });
  });

  it('getStats aggregates counts across the platform', async () => {
    prisma.clinic.count.mockResolvedValue(3);
    prisma.branch.count.mockResolvedValue(4);
    prisma.doctor.count.mockResolvedValue(5);
    prisma.booking.count.mockResolvedValue(10);
    prisma.businessLead.count.mockResolvedValue(2);
    prisma.user.count.mockImplementation(({ where }: { where: { role: string } }) =>
      Promise.resolve(where.role === 'PATIENT' ? 20 : 3),
    );

    const result = await service.getStats();
    expect(result).toEqual({ clinics: 3, branches: 4, doctors: 5, bookings: 10, leads: 2, patients: 20, clinicAdmins: 3 });
  });

  it('createService throws NotFoundException when the clinic does not exist', async () => {
    prisma.clinic.findUnique.mockResolvedValue(null);
    await expect(service.createService({ clinicId: 'clinic-1', name: 'Konsultatsiya', price: 50000 })).rejects.toThrow(NotFoundException);
    expect(prisma.service.create).not.toHaveBeenCalled();
  });

  it('createService creates the service when the clinic exists', async () => {
    prisma.clinic.findUnique.mockResolvedValue({ id: 'clinic-1' });
    prisma.service.create.mockResolvedValue({ id: 'svc-1', clinicId: 'clinic-1', name: 'Konsultatsiya', price: 50000 });

    const result = await service.createService({ clinicId: 'clinic-1', name: 'Konsultatsiya', price: 50000 });
    expect(prisma.service.create).toHaveBeenCalledWith({ data: { clinicId: 'clinic-1', name: 'Konsultatsiya', price: 50000 } });
    expect(result).toEqual({ id: 'svc-1', clinicId: 'clinic-1', name: 'Konsultatsiya', price: 50000 });
  });

  it('updateService throws NotFoundException when the service does not exist', async () => {
    prisma.service.findUnique.mockResolvedValue(null);
    await expect(service.updateService('svc-1', { name: 'New name' })).rejects.toThrow(NotFoundException);
  });

  it('updateService throws NotFoundException when reassigning to a clinic that does not exist', async () => {
    prisma.service.findUnique.mockResolvedValue({ id: 'svc-1' });
    prisma.clinic.findUnique.mockResolvedValue(null);
    await expect(service.updateService('svc-1', { clinicId: 'no-such-clinic' })).rejects.toThrow(NotFoundException);
    expect(prisma.service.update).not.toHaveBeenCalled();
  });

  it('removeService throws NotFoundException when the service does not exist', async () => {
    prisma.service.findUnique.mockResolvedValue(null);
    await expect(service.removeService('svc-1')).rejects.toThrow(NotFoundException);
    expect(prisma.service.delete).not.toHaveBeenCalled();
  });

  it('removeService deletes the service when it exists', async () => {
    prisma.service.findUnique.mockResolvedValue({ id: 'svc-1' });
    prisma.service.delete.mockResolvedValue({ id: 'svc-1' });

    const result = await service.removeService('svc-1');
    expect(prisma.service.delete).toHaveBeenCalledWith({ where: { id: 'svc-1' } });
    expect(result).toEqual({ removed: true });
  });

  it('removeLead throws NotFoundException when the lead does not exist', async () => {
    prisma.businessLead.findUnique.mockResolvedValue(null);
    await expect(service.removeLead('lead-1')).rejects.toThrow(NotFoundException);
    expect(prisma.businessLead.delete).not.toHaveBeenCalled();
  });

  it('removeLead deletes the lead when it exists', async () => {
    prisma.businessLead.findUnique.mockResolvedValue({ id: 'lead-1' });
    prisma.businessLead.delete.mockResolvedValue({ id: 'lead-1' });

    const result = await service.removeLead('lead-1');
    expect(prisma.businessLead.delete).toHaveBeenCalledWith({ where: { id: 'lead-1' } });
    expect(result).toEqual({ removed: true });
  });

  it('createClinic throws ConflictException when the slug is already taken', async () => {
    prisma.clinic.create.mockRejectedValue(prismaError('P2002'));
    await expect(service.createClinic({ slug: 'smile-dental', name: 'Smile Dental' })).rejects.toThrow(ConflictException);
  });

  it('createClinic creates the clinic when the slug is free', async () => {
    prisma.clinic.create.mockResolvedValue({ id: 'clinic-1', slug: 'new-clinic', name: 'New Clinic' });
    const result = await service.createClinic({ slug: 'new-clinic', name: 'New Clinic' });
    expect(result).toEqual({ id: 'clinic-1', slug: 'new-clinic', name: 'New Clinic' });
  });

  it('updateClinic throws NotFoundException when the clinic does not exist', async () => {
    prisma.clinic.findUnique.mockResolvedValue(null);
    await expect(service.updateClinic('clinic-1', { name: 'New name' })).rejects.toThrow(NotFoundException);
    expect(prisma.clinic.update).not.toHaveBeenCalled();
  });

  it('removeClinic throws NotFoundException when the clinic does not exist', async () => {
    prisma.clinic.findUnique.mockResolvedValue(null);
    await expect(service.removeClinic('clinic-1')).rejects.toThrow(NotFoundException);
  });

  it('removeClinic blocks deletion naming what still needs removing first', async () => {
    prisma.clinic.findUnique.mockResolvedValue({ id: 'clinic-1' });
    prisma.branch.count.mockResolvedValue(2);
    prisma.doctor.count.mockResolvedValue(1);
    prisma.service.count.mockResolvedValue(0);

    await expect(service.removeClinic('clinic-1')).rejects.toThrow(ConflictException);
    expect(prisma.clinic.delete).not.toHaveBeenCalled();
  });

  it('removeClinic deletes the clinic once it has no branches, doctors, or services', async () => {
    prisma.clinic.findUnique.mockResolvedValue({ id: 'clinic-1' });
    prisma.branch.count.mockResolvedValue(0);
    prisma.doctor.count.mockResolvedValue(0);
    prisma.service.count.mockResolvedValue(0);
    prisma.clinic.delete.mockResolvedValue({ id: 'clinic-1' });

    const result = await service.removeClinic('clinic-1');
    expect(prisma.clinic.delete).toHaveBeenCalledWith({ where: { id: 'clinic-1' } });
    expect(result).toEqual({ removed: true });
  });

  it('createBranch throws NotFoundException when the clinic does not exist', async () => {
    prisma.clinic.findUnique.mockResolvedValue(null);
    await expect(service.createBranch('clinic-1', { name: 'Branch', address: 'Addr', phone: '+998', lat: 41, lng: 69 })).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.branch.create).not.toHaveBeenCalled();
  });

  it('createBranch creates the branch scoped to the clinic', async () => {
    prisma.clinic.findUnique.mockResolvedValue({ id: 'clinic-1' });
    prisma.branch.create.mockResolvedValue({ id: 'branch-1', clinicId: 'clinic-1' });

    const result = await service.createBranch('clinic-1', { name: 'Branch', address: 'Addr', phone: '+998', lat: 41, lng: 69 });
    expect(prisma.branch.create).toHaveBeenCalledWith({
      data: { name: 'Branch', address: 'Addr', phone: '+998', lat: 41, lng: 69, clinicId: 'clinic-1' },
    });
    expect(result).toEqual({ id: 'branch-1', clinicId: 'clinic-1' });
  });

  it('removeBranch throws ConflictException when doctors still reference it', async () => {
    prisma.branch.findUnique.mockResolvedValue({ id: 'branch-1' });
    prisma.branch.delete.mockRejectedValue(prismaError('P2003'));
    await expect(service.removeBranch('branch-1')).rejects.toThrow(ConflictException);
  });

  it('removeBranch deletes the branch when nothing references it', async () => {
    prisma.branch.findUnique.mockResolvedValue({ id: 'branch-1' });
    prisma.branch.delete.mockResolvedValue({ id: 'branch-1' });

    const result = await service.removeBranch('branch-1');
    expect(result).toEqual({ removed: true });
  });

  it('createDoctor throws NotFoundException when the clinic does not exist', async () => {
    prisma.clinic.findUnique.mockResolvedValue(null);
    await expect(
      service.createDoctor({ clinicId: 'clinic-1', branchId: 'branch-1', name: 'Dr. A', specialty: 'Dentist', experienceYrs: 3 }),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.doctor.create).not.toHaveBeenCalled();
  });

  it('createDoctor throws BadRequestException when the branch does not belong to the clinic', async () => {
    prisma.clinic.findUnique.mockResolvedValue({ id: 'clinic-1' });
    prisma.branch.findUnique.mockResolvedValue({ id: 'branch-1', clinicId: 'other-clinic' });
    await expect(
      service.createDoctor({ clinicId: 'clinic-1', branchId: 'branch-1', name: 'Dr. A', specialty: 'Dentist', experienceYrs: 3 }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.doctor.create).not.toHaveBeenCalled();
  });

  it('createDoctor creates the doctor when the branch belongs to the clinic', async () => {
    prisma.clinic.findUnique.mockResolvedValue({ id: 'clinic-1' });
    prisma.branch.findUnique.mockResolvedValue({ id: 'branch-1', clinicId: 'clinic-1' });
    prisma.doctor.create.mockResolvedValue({ id: 'doctor-1', clinicId: 'clinic-1', branchId: 'branch-1' });

    const result = await service.createDoctor({ clinicId: 'clinic-1', branchId: 'branch-1', name: 'Dr. A', specialty: 'Dentist', experienceYrs: 3 });
    expect(result).toEqual({ id: 'doctor-1', clinicId: 'clinic-1', branchId: 'branch-1' });
  });

  it('updateDoctor throws NotFoundException when the doctor does not exist', async () => {
    prisma.doctor.findUnique.mockResolvedValue(null);
    await expect(service.updateDoctor('doctor-1', { name: 'New name' })).rejects.toThrow(NotFoundException);
  });

  it('updateDoctor throws BadRequestException when reassigning to a branch outside the clinic', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1', clinicId: 'clinic-1', branchId: 'branch-1' });
    prisma.clinic.findUnique.mockResolvedValue({ id: 'clinic-1' });
    prisma.branch.findUnique.mockResolvedValue({ id: 'branch-2', clinicId: 'other-clinic' });

    await expect(service.updateDoctor('doctor-1', { branchId: 'branch-2' })).rejects.toThrow(BadRequestException);
    expect(prisma.doctor.update).not.toHaveBeenCalled();
  });

  it('updateDoctor updates the doctor when no clinic/branch change is requested', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1', clinicId: 'clinic-1', branchId: 'branch-1' });
    prisma.doctor.update.mockResolvedValue({ id: 'doctor-1', name: 'New name' });

    const result = await service.updateDoctor('doctor-1', { name: 'New name' });
    expect(result).toEqual({ id: 'doctor-1', name: 'New name' });
  });

  it('removeDoctor throws NotFoundException when the doctor does not exist', async () => {
    prisma.doctor.findUnique.mockResolvedValue(null);
    await expect(service.removeDoctor('doctor-1')).rejects.toThrow(NotFoundException);
    expect(prisma.doctor.delete).not.toHaveBeenCalled();
  });

  it('removeDoctor throws ConflictException when the doctor has existing bookings', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });
    prisma.doctor.delete.mockRejectedValue(prismaError('P2003'));
    await expect(service.removeDoctor('doctor-1')).rejects.toThrow(ConflictException);
  });

  it('removeDoctor deletes the doctor when nothing references it', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });
    prisma.doctor.delete.mockResolvedValue({ id: 'doctor-1' });

    const result = await service.removeDoctor('doctor-1');
    expect(result).toEqual({ removed: true });
  });

  it('updateUser throws ForbiddenException when editing your own account', async () => {
    await expect(service.updateUser('user-1', 'user-1', { name: 'New name' })).rejects.toThrow(ForbiddenException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('updateUser throws NotFoundException when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.updateUser('admin-1', 'user-1', { name: 'New name' })).rejects.toThrow(NotFoundException);
  });

  it('updateUser updates the name when the target user exists', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
    prisma.user.update.mockResolvedValue({ id: 'user-1', name: 'New name' });

    const result = await service.updateUser('admin-1', 'user-1', { name: 'New name' });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { name: 'New name' },
      select: { id: true, phone: true, name: true, role: true, createdAt: true },
    });
    expect(result).toEqual({ id: 'user-1', name: 'New name' });
  });

  it('removeUser throws ForbiddenException when deleting your own account', async () => {
    await expect(service.removeUser('user-1', 'user-1')).rejects.toThrow(ForbiddenException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('removeUser throws NotFoundException when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.removeUser('admin-1', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('removeUser blocks deletion naming what still needs removing first', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
    prisma.booking.count.mockResolvedValue(2);
    prisma.clinic.count.mockResolvedValue(1);
    prisma.doctor.count.mockResolvedValue(0);

    await expect(service.removeUser('admin-1', 'user-1')).rejects.toThrow(ConflictException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('removeUser deletes the user once bookings, owned clinics, and doctor links are all clear', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
    prisma.booking.count.mockResolvedValue(0);
    prisma.clinic.count.mockResolvedValue(0);
    prisma.doctor.count.mockResolvedValue(0);
    prisma.user.delete.mockResolvedValue({ id: 'user-1' });

    const result = await service.removeUser('admin-1', 'user-1');
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    expect(result).toEqual({ removed: true });
  });

  it('updateBookingStatus throws NotFoundException when the booking does not exist', async () => {
    prisma.booking.findUnique.mockResolvedValue(null);
    await expect(service.updateBookingStatus('booking-1', { status: 'CONFIRMED' })).rejects.toThrow(NotFoundException);
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  it('updateBookingStatus updates the status when the booking exists', async () => {
    prisma.booking.findUnique.mockResolvedValue({ id: 'booking-1' });
    prisma.booking.update.mockResolvedValue({ id: 'booking-1', status: 'CONFIRMED' });

    const result = await service.updateBookingStatus('booking-1', { status: 'CONFIRMED' });
    expect(prisma.booking.update).toHaveBeenCalledWith({ where: { id: 'booking-1' }, data: { status: 'CONFIRMED' } });
    expect(result).toEqual({ id: 'booking-1', status: 'CONFIRMED' });
  });

  it('listContent delegates to ContentService.listAll', async () => {
    content.listAll.mockResolvedValue([{ id: '1', key: 'home.hero.title' }]);
    const result = await service.listContent();
    expect(content.listAll).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', key: 'home.hero.title' }]);
  });

  it('updateContent delegates to ContentService.update', async () => {
    content.update.mockResolvedValue({ id: 'row-1', uz: 'Yangi matn' });
    const result = await service.updateContent('row-1', { uz: 'Yangi matn' });
    expect(content.update).toHaveBeenCalledWith('row-1', { uz: 'Yangi matn' });
    expect(result).toEqual({ id: 'row-1', uz: 'Yangi matn' });
  });
});
