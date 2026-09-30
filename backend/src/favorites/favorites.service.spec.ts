import { NotFoundException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prisma: { doctor: any; favorite: any };

  beforeEach(() => {
    prisma = {
      doctor: { findUnique: jest.fn() },
      favorite: { findMany: jest.fn(), upsert: jest.fn(), deleteMany: jest.fn() },
    };
    service = new FavoritesService(prisma as unknown as PrismaService);
  });

  it('add throws NotFoundException when the doctor does not exist', async () => {
    prisma.doctor.findUnique.mockResolvedValue(null);
    await expect(service.add('user-1', 'doc-1')).rejects.toThrow(NotFoundException);
    expect(prisma.favorite.upsert).not.toHaveBeenCalled();
  });

  it('add upserts a favorite so re-favoriting the same doctor is idempotent', async () => {
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doc-1' });
    prisma.favorite.upsert.mockResolvedValue({ id: 'fav-1', userId: 'user-1', doctorId: 'doc-1' });

    const result = await service.add('user-1', 'doc-1');
    expect(prisma.favorite.upsert).toHaveBeenCalledWith({
      where: { userId_doctorId: { userId: 'user-1', doctorId: 'doc-1' } },
      update: {},
      create: { userId: 'user-1', doctorId: 'doc-1' },
    });
    expect(result).toEqual({ id: 'fav-1', userId: 'user-1', doctorId: 'doc-1' });
  });

  it('remove deletes the favorite for that user/doctor pair', async () => {
    prisma.favorite.deleteMany.mockResolvedValue({ count: 1 });
    const result = await service.remove('user-1', 'doc-1');
    expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1', doctorId: 'doc-1' } });
    expect(result).toEqual({ removed: true });
  });
});
