import { NotFoundException } from '@nestjs/common';
import { ContentService } from './content.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ContentService', () => {
  let service: ContentService;
  let prisma: { siteContent: any };

  beforeEach(() => {
    prisma = {
      siteContent: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    };
    service = new ContentService(prisma as unknown as PrismaService);
  });

  it('getPublicMap returns a key-keyed map of locale values, dropping the label/id/updatedAt fields', async () => {
    prisma.siteContent.findMany.mockResolvedValue([
      { key: 'home.hero.title', uz: 'Salom', ru: 'Привет', en: 'Hello' },
      { key: 'home.hero.subtitle', uz: 'Ikkinchi', ru: '', en: '' },
    ]);

    const result = await service.getPublicMap();
    expect(prisma.siteContent.findMany).toHaveBeenCalledWith({
      select: { key: true, uz: true, ru: true, en: true },
    });
    expect(result).toEqual({
      'home.hero.title': { uz: 'Salom', ru: 'Привет', en: 'Hello' },
      'home.hero.subtitle': { uz: 'Ikkinchi', ru: '', en: '' },
    });
  });

  it('listAll returns rows ordered by key', async () => {
    prisma.siteContent.findMany.mockResolvedValue([{ id: '1', key: 'a.b' }]);
    const result = await service.listAll();
    expect(prisma.siteContent.findMany).toHaveBeenCalledWith({ orderBy: { key: 'asc' } });
    expect(result).toEqual([{ id: '1', key: 'a.b' }]);
  });

  it('update throws NotFoundException when the row does not exist', async () => {
    prisma.siteContent.findUnique.mockResolvedValue(null);
    await expect(service.update('missing-id', { uz: 'x' })).rejects.toThrow(NotFoundException);
    expect(prisma.siteContent.update).not.toHaveBeenCalled();
  });

  it('update saves the new values when the row exists', async () => {
    prisma.siteContent.findUnique.mockResolvedValue({ id: 'row-1', key: 'home.hero.title' });
    prisma.siteContent.update.mockResolvedValue({ id: 'row-1', uz: 'Yangi matn' });

    const result = await service.update('row-1', { uz: 'Yangi matn' });
    expect(prisma.siteContent.update).toHaveBeenCalledWith({ where: { id: 'row-1' }, data: { uz: 'Yangi matn' } });
    expect(result).toEqual({ id: 'row-1', uz: 'Yangi matn' });
  });
});
